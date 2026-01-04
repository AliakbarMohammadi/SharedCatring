const { WeeklyReservation, ReservationItem } = require('../models');
const { getWeekStart, mealTypeLabels } = require('../utils/helpers');
const menuClient = require('../utils/menuClient');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class ReservationService {
  async create(userId, reservationData) {
    const { companyId, weekStartDate, items } = reservationData;

    // Check for existing reservation
    const existing = await WeeklyReservation.findOne({
      where: {
        userId,
        weekStartDate: getWeekStart(weekStartDate),
        status: 'active'
      }
    });

    if (existing) {
      throw {
        statusCode: 409,
        code: 'ERR_RESERVATION_EXISTS',
        message: 'رزرو هفتگی برای این هفته قبلاً ثبت شده است'
      };
    }

    // Fetch food info from Menu Service
    const foodIds = [...new Set(items.map(item => item.foodId))];
    const foodMap = await menuClient.getFoodsByIds(foodIds);

    // Validate all foods exist
    for (const item of items) {
      if (!foodMap.has(item.foodId)) {
        throw {
          statusCode: 404,
          code: 'ERR_FOOD_NOT_FOUND',
          message: `غذا با شناسه ${item.foodId} یافت نشد`
        };
      }
    }

    // Calculate total using prices from Menu Service
    let totalAmount = 0;
    const enrichedItems = items.map(item => {
      const food = foodMap.get(item.foodId);
      const quantity = item.quantity || 1;
      totalAmount += food.price * quantity;
      return {
        ...item,
        foodName: food.name,
        unitPrice: food.price,
        quantity
      };
    });

    const reservation = await WeeklyReservation.create({
      userId,
      companyId,
      weekStartDate: getWeekStart(weekStartDate),
      totalAmount,
      status: 'active'
    });

    // Create reservation items
    for (const item of enrichedItems) {
      await ReservationItem.create({
        reservationId: reservation.id,
        date: item.date,
        mealType: item.mealType,
        foodId: item.foodId,
        foodName: item.foodName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        status: 'scheduled'
      });
    }

    logger.info('رزرو هفتگی ایجاد شد', { reservationId: reservation.id, userId });

    return this.findById(reservation.id);
  }

  async findById(id) {
    const reservation = await WeeklyReservation.findByPk(id, {
      include: [{ model: ReservationItem, as: 'items', order: [['date', 'ASC'], ['meal_type', 'ASC']] }]
    });

    if (!reservation) {
      throw { statusCode: 404, code: 'ERR_RESERVATION_NOT_FOUND', message: 'رزرو یافت نشد' };
    }

    return this.formatReservation(reservation);
  }

  async getCurrentReservation(userId) {
    const weekStart = getWeekStart();

    const reservation = await WeeklyReservation.findOne({
      where: {
        userId,
        weekStartDate: weekStart,
        status: 'active'
      },
      include: [{ model: ReservationItem, as: 'items', order: [['date', 'ASC'], ['meal_type', 'ASC']] }]
    });

    if (!reservation) {
      return null;
    }

    return this.formatReservation(reservation);
  }

  async update(id, userId, updateData) {
    const reservation = await WeeklyReservation.findOne({
      where: { id, userId }
    });

    if (!reservation) {
      throw { statusCode: 404, code: 'ERR_RESERVATION_NOT_FOUND', message: 'رزرو یافت نشد' };
    }

    if (reservation.status !== 'active') {
      throw { statusCode: 400, code: 'ERR_RESERVATION_NOT_ACTIVE', message: 'این رزرو قابل ویرایش نیست' };
    }

    const { items } = updateData;

    if (items) {
      // Fetch food info from Menu Service
      const foodIds = [...new Set(items.map(item => item.foodId))];
      const foodMap = await menuClient.getFoodsByIds(foodIds);

      // Validate all foods exist
      for (const item of items) {
        if (!foodMap.has(item.foodId)) {
          throw {
            statusCode: 404,
            code: 'ERR_FOOD_NOT_FOUND',
            message: `غذا با شناسه ${item.foodId} یافت نشد`
          };
        }
      }

      // Delete existing items and recreate
      await ReservationItem.destroy({ where: { reservationId: id } });

      let totalAmount = 0;
      for (const item of items) {
        const food = foodMap.get(item.foodId);
        const quantity = item.quantity || 1;
        totalAmount += food.price * quantity;
        
        await ReservationItem.create({
          reservationId: id,
          date: item.date,
          mealType: item.mealType,
          foodId: item.foodId,
          foodName: food.name,
          quantity,
          unitPrice: food.price,
          status: 'scheduled'
        });
      }

      await reservation.update({ totalAmount });
    }

    logger.info('رزرو هفتگی ویرایش شد', { reservationId: id });

    return this.findById(id);
  }

  async cancelDay(id, userId, date) {
    const reservation = await WeeklyReservation.findOne({
      where: { id, userId }
    });

    if (!reservation) {
      throw { statusCode: 404, code: 'ERR_RESERVATION_NOT_FOUND', message: 'رزرو یافت نشد' };
    }

    // Cancel all items for the specified date
    const [updatedCount] = await ReservationItem.update(
      { status: 'cancelled' },
      { where: { reservationId: id, date, status: 'scheduled' } }
    );

    if (updatedCount === 0) {
      throw { statusCode: 404, code: 'ERR_NO_ITEMS_FOR_DATE', message: 'آیتمی برای این تاریخ یافت نشد' };
    }

    // Recalculate total
    const activeItems = await ReservationItem.findAll({
      where: { reservationId: id, status: 'scheduled' }
    });

    const totalAmount = activeItems.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) || 0) * item.quantity;
    }, 0);

    await reservation.update({ totalAmount });

    logger.info('روز از رزرو لغو شد', { reservationId: id, date });

    return this.findById(id);
  }

  async cancel(id, userId) {
    const reservation = await WeeklyReservation.findOne({
      where: { id, userId }
    });

    if (!reservation) {
      throw { statusCode: 404, code: 'ERR_RESERVATION_NOT_FOUND', message: 'رزرو یافت نشد' };
    }

    await reservation.update({ status: 'cancelled' });
    await ReservationItem.update(
      { status: 'cancelled' },
      { where: { reservationId: id, status: 'scheduled' } }
    );

    logger.info('رزرو هفتگی لغو شد', { reservationId: id });

    return this.findById(id);
  }

  formatReservation(reservation) {
    // Group items by date
    const itemsByDate = {};
    reservation.items?.forEach(item => {
      const dateKey = item.date;
      if (!itemsByDate[dateKey]) {
        itemsByDate[dateKey] = { date: dateKey, meals: {} };
      }
      if (!itemsByDate[dateKey].meals[item.mealType]) {
        itemsByDate[dateKey].meals[item.mealType] = {
          mealType: item.mealType,
          mealTypeLabel: mealTypeLabels[item.mealType],
          items: []
        };
      }
      itemsByDate[dateKey].meals[item.mealType].items.push({
        id: item.id,
        foodId: item.foodId,
        foodName: item.foodName,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        status: item.status
      });
    });

    return {
      id: reservation.id,
      userId: reservation.userId,
      companyId: reservation.companyId,
      weekStartDate: reservation.weekStartDate,
      status: reservation.status,
      totalAmount: parseFloat(reservation.totalAmount),
      days: Object.values(itemsByDate).sort((a, b) => new Date(a.date) - new Date(b.date)),
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt
    };
  }
}

module.exports = new ReservationService();
