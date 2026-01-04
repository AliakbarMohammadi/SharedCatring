const { Order, OrderItem, OrderStatusHistory, Cart, CartItem } = require('../models');
const { generateOrderNumber, getStartOfDay, getEndOfDay, orderStatusLabels } = require('../utils/helpers');
const menuClient = require('../utils/menuClient');
const companyClient = require('../utils/companyClient');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');
const config = require('../config');
const { Op } = require('sequelize');

class OrderService {
  /**
   * Create a new order
   * ایجاد سفارش جدید با پشتیبانی از Graceful Degradation
   */
  async create(userId, orderData, user = {}) {
    const {
      orderType = 'personal',
      items,
      deliveryDate,
      deliveryTimeSlot,
      deliveryAddress,
      deliveryNotes,
      promoCode,
      mealType = 'lunch',
      notes
    } = orderData;

    // Get companyId from user token or orderData
    const companyId = user.companyId || orderData.companyId || null;
    const employeeId = orderData.employeeId || null;

    // Build fallback map from client-provided data
    const fallbackMap = new Map();
    items.forEach(item => {
      if (item.foodName && item.unitPrice) {
        fallbackMap.set(item.foodId, {
          id: item.foodId,
          name: item.foodName,
          price: parseFloat(item.unitPrice),
          isAvailable: true // Assume available when using fallback
        });
      }
    });

    // Try to fetch food info from Menu Service
    let foodMap = new Map();
    let menuServiceAvailable = true;
    
    try {
      const foodIds = items.map(item => item.foodId);
      foodMap = await menuClient.getFoodsByIds(foodIds, fallbackMap);
    } catch (error) {
      menuServiceAvailable = false;
      logger.warn('Menu Service در دسترس نیست، استفاده از داده‌های fallback', {
        error: error.message,
        itemCount: items.length
      });
      
      // Use fallback data if available
      foodMap = fallbackMap;
    }

    // Validate items - with graceful handling
    const orderItems = [];
    let subtotal = 0;
    const warnings = [];

    for (const item of items) {
      let food = foodMap.get(item.foodId);
      
      // If no food data from Menu Service, try to use client-provided data
      if (!food && item.foodName && item.unitPrice) {
        food = {
          id: item.foodId,
          name: item.foodName,
          price: parseFloat(item.unitPrice),
          isAvailable: true
        };
        warnings.push(`اطلاعات غذای "${item.foodName}" از کلاینت استفاده شد (Menu Service در دسترس نبود)`);
        logger.warn('استفاده از داده‌های کلاینت برای غذا', { foodId: item.foodId, foodName: item.foodName });
      }

      // If still no food data, throw error
      if (!food) {
        throw {
          statusCode: 404,
          code: 'ERR_FOOD_NOT_FOUND',
          message: `غذا با شناسه ${item.foodId} یافت نشد. لطفاً نام و قیمت غذا را نیز ارسال کنید.`
        };
      }

      // Check availability only if Menu Service was available
      if (menuServiceAvailable && !food.isAvailable) {
        throw {
          statusCode: 400,
          code: 'ERR_FOOD_UNAVAILABLE',
          message: `غذای "${food.name}" در حال حاضر موجود نیست`
        };
      }

      // Calculate item total
      const totalPrice = food.price * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        foodId: item.foodId,
        foodName: food.name,
        quantity: item.quantity,
        unitPrice: food.price,
        totalPrice,
        notes: item.notes
      });
    }

    // TODO: Apply promo code discount
    let discountAmount = 0;
    
    // Calculate subsidy for corporate orders
    let subsidyAmount = 0;
    let subsidyInfo = null;
    let finalEmployeeId = employeeId;

    if (orderType === 'corporate' && companyId) {
      try {
        subsidyInfo = await companyClient.calculateSubsidy(
          companyId,
          userId,
          subtotal,
          mealType
        );
        
        subsidyAmount = subsidyInfo.subsidyAmount || 0;
        
        if (subsidyInfo.employeeId) {
          finalEmployeeId = subsidyInfo.employeeId;
        }

        logger.info('یارانه محاسبه شد', {
          companyId,
          userId,
          subtotal,
          subsidyAmount,
          ruleName: subsidyInfo.ruleName
        });

        if (subsidyInfo.reason && subsidyAmount === 0) {
          warnings.push(`یارانه: ${subsidyInfo.reason}`);
        }
      } catch (error) {
        logger.error('خطا در محاسبه یارانه', { error: error.message });
        warnings.push('محاسبه یارانه با خطا مواجه شد');
      }
    }
    
    // TODO: Calculate tax
    let taxAmount = 0;
    
    // TODO: Calculate delivery fee
    let deliveryFee = 0;

    const totalAmount = subtotal - discountAmount + taxAmount + deliveryFee;
    const userPayable = totalAmount - subsidyAmount;
    const companyPayable = subsidyAmount;

    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId,
      companyId,
      employeeId: finalEmployeeId,
      orderType,
      status: 'pending',
      subtotal,
      discountAmount,
      subsidyAmount,
      taxAmount,
      deliveryFee,
      totalAmount,
      userPayable,
      companyPayable,
      deliveryDate,
      deliveryTimeSlot,
      deliveryAddress,
      deliveryNotes,
      promoCode,
      notes
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({ ...item, orderId: order.id });
    }

    // Create initial status history
    await OrderStatusHistory.create({
      orderId: order.id,
      status: 'pending',
      changedBy: userId,
      notes: menuServiceAvailable ? 'سفارش ثبت شد' : 'سفارش ثبت شد (بدون تأیید از سرویس منو)'
    });

    // Clear cart if items came from cart
    if (orderData.fromCart) {
      const cart = await Cart.findOne({ where: { userId } });
      if (cart) {
        await CartItem.destroy({ where: { cartId: cart.id } });
      }
    }

    // Publish event (don't fail order if event publishing fails)
    try {
      await eventPublisher.publish('order.created', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
        totalAmount,
        deliveryDate,
        menuServiceVerified: menuServiceAvailable
      });
    } catch (eventError) {
      logger.error('خطا در ارسال رویداد سفارش', { error: eventError.message, orderId: order.id });
    }

    logger.info('سفارش ایجاد شد', { 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      menuServiceAvailable,
      warnings: warnings.length > 0 ? warnings : undefined
    });

    const result = await this.findById(order.id);
    
    // Add warnings to response if any
    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  }

  async findAll(userId, options = {}) {
    const { page = 1, limit = 20, status, orderType, fromDate, toDate } = options;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (status) where.status = status;
    if (orderType) where.orderType = orderType;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      orders: rows.map(order => this.formatOrder(order)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async findById(id) {
    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderStatusHistory, as: 'statusHistory', order: [['created_at', 'DESC']] }
      ]
    });

    if (!order) {
      throw { statusCode: 404, code: 'ERR_ORDER_NOT_FOUND', message: 'سفارش یافت نشد' };
    }

    return this.formatOrder(order);
  }

  async findByOrderNumber(orderNumber) {
    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderStatusHistory, as: 'statusHistory', order: [['created_at', 'DESC']] }
      ]
    });

    if (!order) {
      throw { statusCode: 404, code: 'ERR_ORDER_NOT_FOUND', message: 'سفارش یافت نشد' };
    }

    return this.formatOrder(order);
  }

  async updateStatus(id, status, changedBy, notes = null) {
    const order = await Order.findByPk(id);
    if (!order) {
      throw { statusCode: 404, code: 'ERR_ORDER_NOT_FOUND', message: 'سفارش یافت نشد' };
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled', 'rejected'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: ['completed'],
      completed: [],
      cancelled: [],
      rejected: []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw {
        statusCode: 400,
        code: 'ERR_INVALID_STATUS_TRANSITION',
        message: `تغییر وضعیت از "${orderStatusLabels[order.status]}" به "${orderStatusLabels[status]}" مجاز نیست`
      };
    }

    // Update timestamps based on status
    const timestampFields = {
      confirmed: 'confirmedAt',
      preparing: 'preparingAt',
      ready: 'readyAt',
      delivered: 'deliveredAt',
      cancelled: 'cancelledAt'
    };

    const updateData = { status };
    if (timestampFields[status]) {
      updateData[timestampFields[status]] = new Date();
    }

    await order.update(updateData);

    // Create status history
    await OrderStatusHistory.create({
      orderId: id,
      status,
      changedBy,
      notes: notes || `وضعیت به "${orderStatusLabels[status]}" تغییر کرد`
    });

    // Publish event (don't fail if event publishing fails)
    try {
      await eventPublisher.publish(`order.${status}`, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status
      });
    } catch (eventError) {
      logger.error('خطا در ارسال رویداد تغییر وضعیت', { error: eventError.message, orderId: id });
    }

    logger.info('وضعیت سفارش تغییر کرد', { orderId: id, status });

    return this.findById(id);
  }

  async cancel(id, userId, reason) {
    const order = await Order.findByPk(id);
    if (!order) {
      throw { statusCode: 404, code: 'ERR_ORDER_NOT_FOUND', message: 'سفارش یافت نشد' };
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw {
        statusCode: 400,
        code: 'ERR_CANNOT_CANCEL',
        message: 'این سفارش قابل لغو نیست'
      };
    }

    await order.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason
    });

    await OrderStatusHistory.create({
      orderId: id,
      status: 'cancelled',
      changedBy: userId,
      notes: reason || 'سفارش لغو شد'
    });

    try {
      await eventPublisher.publish('order.cancelled', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        reason
      });
    } catch (eventError) {
      logger.error('خطا در ارسال رویداد لغو سفارش', { error: eventError.message, orderId: id });
    }

    logger.info('سفارش لغو شد', { orderId: id, reason });

    return this.findById(id);
  }

  async reorder(orderId, userId) {
    const originalOrder = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!originalOrder) {
      throw { statusCode: 404, code: 'ERR_ORDER_NOT_FOUND', message: 'سفارش یافت نشد' };
    }

    // Create new order with same items (include fallback data)
    const newOrderData = {
      companyId: originalOrder.companyId,
      employeeId: originalOrder.employeeId,
      orderType: originalOrder.orderType,
      items: originalOrder.items.map(item => ({
        foodId: item.foodId,
        foodName: item.foodName,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice)
      })),
      deliveryDate: new Date().toISOString().split('T')[0], // Today
      deliveryAddress: originalOrder.deliveryAddress,
      notes: `سفارش مجدد از ${originalOrder.orderNumber}`
    };

    return this.create(userId, newOrderData);
  }

  // Kitchen methods
  async getTodayOrders(mealType = null) {
    const today = getStartOfDay();
    const tomorrow = getEndOfDay();

    const where = {
      deliveryDate: { [Op.between]: [today, tomorrow] },
      status: { [Op.in]: ['confirmed', 'preparing', 'ready'] }
    };

    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['delivery_time_slot', 'ASC'], ['created_at', 'ASC']]
    });

    return orders.map(order => this.formatOrder(order));
  }

  async getKitchenQueue() {
    const orders = await Order.findAll({
      where: { status: { [Op.in]: ['confirmed', 'preparing'] } },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['delivery_date', 'ASC'], ['delivery_time_slot', 'ASC'], ['created_at', 'ASC']]
    });

    return orders.map(order => this.formatOrder(order));
  }

  async getKitchenSummary(date = new Date()) {
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);

    const orders = await Order.findAll({
      where: {
        deliveryDate: { [Op.between]: [start, end] },
        status: { [Op.notIn]: ['cancelled', 'rejected'] }
      },
      include: [{ model: OrderItem, as: 'items' }]
    });

    // Aggregate items
    const itemSummary = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSummary[item.foodId]) {
          itemSummary[item.foodId] = {
            foodId: item.foodId,
            foodName: item.foodName,
            totalQuantity: 0
          };
        }
        itemSummary[item.foodId].totalQuantity += item.quantity;
      });
    });

    return {
      date: date.toISOString().split('T')[0],
      totalOrders: orders.length,
      statusBreakdown: {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length
      },
      items: Object.values(itemSummary).sort((a, b) => b.totalQuantity - a.totalQuantity)
    };
  }

  // Company methods
  async getCompanyOrders(companyId, options = {}) {
    const { page = 1, limit = 20, status, fromDate, toDate } = options;
    const offset = (page - 1) * limit;

    const where = { companyId };
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      orders: rows.map(order => this.formatOrder(order)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async getCompanySummary(companyId, fromDate, toDate) {
    const where = { companyId };
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const orders = await Order.findAll({ where });

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
    const totalSubsidy = orders.reduce((sum, o) => sum + parseFloat(o.subsidyAmount || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    return {
      companyId,
      period: { from: fromDate, to: toDate },
      totalOrders,
      completedOrders,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalAmount,
      totalSubsidy,
      averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0
    };
  }

  formatOrder(order) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      companyId: order.companyId,
      employeeId: order.employeeId,
      orderType: order.orderType,
      status: order.status,
      statusLabel: orderStatusLabels[order.status],
      subtotal: parseFloat(order.subtotal),
      discountAmount: parseFloat(order.discountAmount),
      subsidyAmount: parseFloat(order.subsidyAmount),
      taxAmount: parseFloat(order.taxAmount),
      deliveryFee: parseFloat(order.deliveryFee),
      totalAmount: parseFloat(order.totalAmount),
      userPayable: parseFloat(order.userPayable),
      companyPayable: parseFloat(order.companyPayable),
      deliveryDate: order.deliveryDate,
      deliveryTimeSlot: order.deliveryTimeSlot,
      deliveryAddress: order.deliveryAddress,
      deliveryNotes: order.deliveryNotes,
      promoCode: order.promoCode,
      notes: order.notes,
      confirmedAt: order.confirmedAt,
      preparingAt: order.preparingAt,
      readyAt: order.readyAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items?.map(item => ({
        id: item.id,
        foodId: item.foodId,
        foodName: item.foodName,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.totalPrice),
        notes: item.notes
      })),
      statusHistory: order.statusHistory?.map(h => ({
        status: h.status,
        statusLabel: orderStatusLabels[h.status],
        changedBy: h.changedBy,
        notes: h.notes,
        createdAt: h.createdAt
      }))
    };
  }
}

module.exports = new OrderService();
