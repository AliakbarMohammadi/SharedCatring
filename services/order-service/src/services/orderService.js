const { Order, OrderItem } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

class OrderService {
  async createOrder(orderData, items) {
    const transaction = await sequelize.transaction();

    try {
      // Calculate totals
      let subtotal = 0;
      const orderItems = items.map(item => {
        const totalPrice = item.unitPrice * item.quantity;
        subtotal += totalPrice;
        return {
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          notes: item.notes
        };
      });

      const discount = orderData.discount || 0;
      const tax = (subtotal - discount) * 0.09; // 9% VAT
      const total = subtotal - discount + tax;

      // Create order
      const order = await Order.create({
        ...orderData,
        subtotal,
        discount,
        tax,
        total
      }, { transaction });

      // Create order items
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        orderId: order.id
      }));
      await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

      await transaction.commit();

      // Fetch complete order with items
      return this.getOrderById(order.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getOrderById(id) {
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      const error = new Error('سفارش یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1500';
      throw error;
    }

    return order;
  }

  async getOrders(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      userId, 
      companyId, 
      status, 
      startDate, 
      endDate,
      mealType 
    } = options;

    const where = {};
    if (userId) where.userId = userId;
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (mealType) where.mealType = mealType;
    if (startDate && endDate) {
      where.deliveryDate = { [Op.between]: [startDate, endDate] };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      orders: rows,
      total: count,
      page,
      limit
    };
  }

  async getUserOrders(userId, options = {}) {
    return this.getOrders({ ...options, userId });
  }

  async getCompanyOrders(companyId, options = {}) {
    return this.getOrders({ ...options, companyId });
  }

  async updateOrderStatus(id, status, additionalData = {}) {
    const order = await Order.findByPk(id);
    
    if (!order) {
      const error = new Error('سفارش یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1500';
      throw error;
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.status].includes(status)) {
      const error = new Error('تغییر وضعیت سفارش مجاز نیست');
      error.statusCode = 400;
      error.errorCode = 'ERR_1504';
      throw error;
    }

    const updateData = { status };

    // Set timestamps based on status
    switch (status) {
      case 'confirmed':
        updateData.confirmedAt = new Date();
        break;
      case 'preparing':
        updateData.preparedAt = new Date();
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        updateData.cancelReason = additionalData.cancelReason;
        break;
    }

    await order.update(updateData);
    return this.getOrderById(id);
  }

  async cancelOrder(id, userId, reason) {
    const order = await Order.findByPk(id);
    
    if (!order) {
      const error = new Error('سفارش یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1500';
      throw error;
    }

    // Check if user owns the order
    if (order.userId !== userId) {
      const error = new Error('شما اجازه لغو این سفارش را ندارید');
      error.statusCode = 403;
      error.errorCode = 'ERR_1004';
      throw error;
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      const error = new Error('امکان لغو این سفارش وجود ندارد');
      error.statusCode = 400;
      error.errorCode = 'ERR_1502';
      throw error;
    }

    return this.updateOrderStatus(id, 'cancelled', { cancelReason: reason });
  }

  async getOrderStats(companyId, startDate, endDate) {
    const where = { companyId };
    if (startDate && endDate) {
      where.deliveryDate = { [Op.between]: [startDate, endDate] };
    }

    const stats = await Order.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalAmount']
      ],
      group: ['status']
    });

    return stats;
  }

  async getDailyOrderSummary(companyId, date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const orders = await Order.findAll({
      where: {
        companyId,
        deliveryDate: date,
        status: { [Op.notIn]: ['cancelled'] }
      },
      include: [{ model: OrderItem, as: 'items' }]
    });

    // Aggregate items
    const itemSummary = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSummary[item.menuItemId]) {
          itemSummary[item.menuItemId] = {
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            totalQuantity: 0,
            totalAmount: 0
          };
        }
        itemSummary[item.menuItemId].totalQuantity += item.quantity;
        itemSummary[item.menuItemId].totalAmount += parseFloat(item.totalPrice);
      });
    });

    return {
      date,
      totalOrders: orders.length,
      totalAmount: orders.reduce((sum, o) => sum + parseFloat(o.total), 0),
      items: Object.values(itemSummary)
    };
  }
}

module.exports = new OrderService();
