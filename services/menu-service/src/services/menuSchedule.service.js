const { MenuSchedule, FoodItem } = require('../models');
const cacheService = require('./cache.service');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');
const { getStartOfDay, getEndOfDay, getWeekRange } = require('../utils/helpers');

class MenuScheduleService {
  async create(data) {
    // Validate food items
    const foodIds = data.items.map(item => item.foodId);
    const foods = await FoodItem.find({ _id: { $in: foodIds } });
    
    if (foods.length !== foodIds.length) {
      throw { statusCode: 400, code: 'ERR_INVALID_ITEMS', message: 'برخی از غذاها یافت نشدند' };
    }

    // Check for duplicate schedule
    const existing = await MenuSchedule.findOne({
      date: getStartOfDay(data.date),
      mealType: data.mealType
    });

    if (existing) {
      throw { statusCode: 409, code: 'ERR_SCHEDULE_EXISTS', message: 'برنامه غذایی برای این تاریخ و وعده قبلاً ثبت شده است' };
    }

    // Set remaining quantity equal to max quantity
    data.items = data.items.map(item => ({
      ...item,
      remainingQuantity: item.remainingQuantity ?? item.maxQuantity
    }));

    data.date = getStartOfDay(data.date);
    const schedule = await MenuSchedule.create(data);
    
    await cacheService.invalidateMenuCache();

    await eventPublisher.publish('menu.daily.published', {
      scheduleId: schedule._id,
      date: schedule.date,
      mealType: schedule.mealType,
      itemCount: schedule.items.length
    });

    logger.info('برنامه غذایی ایجاد شد', { scheduleId: schedule._id, date: schedule.date, mealType: schedule.mealType });
    return schedule;
  }

  async getTodayMenu(mealType = null) {
    // Try cache first
    const cached = await cacheService.getTodayMenu();
    if (cached && !mealType) return cached;

    const today = getStartOfDay();
    const tomorrow = getEndOfDay();

    const query = {
      date: { $gte: today, $lte: tomorrow },
      isActive: true
    };

    if (mealType) {
      query.mealType = mealType;
    }

    const menus = await MenuSchedule.find(query)
      .populate({
        path: 'items.foodId',
        select: 'name slug description thumbnailImage pricing nutrition attributes isAvailable'
      })
      .lean();

    // Format response
    const formatted = menus.map(menu => ({
      ...menu,
      items: menu.items.map(item => ({
        ...item,
        food: item.foodId,
        foodId: item.foodId?._id,
        effectivePrice: item.specialPrice || item.foodId?.pricing?.discountedPrice || item.foodId?.pricing?.basePrice
      }))
    }));

    if (!mealType) {
      await cacheService.setTodayMenu(formatted);
    }

    return formatted;
  }

  async getWeeklyMenu(startDate = null) {
    // Try cache first
    if (!startDate) {
      const cached = await cacheService.getWeeklyMenu();
      if (cached) return cached;
    }

    const { start, end } = getWeekRange(startDate || new Date());

    const menus = await MenuSchedule.find({
      date: { $gte: start, $lte: end },
      isActive: true
    })
      .populate({
        path: 'items.foodId',
        select: 'name slug thumbnailImage pricing'
      })
      .sort({ date: 1, mealType: 1 })
      .lean();

    // Group by date
    const grouped = {};
    menus.forEach(menu => {
      const dateKey = menu.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, meals: {} };
      }
      grouped[dateKey].meals[menu.mealType] = {
        ...menu,
        items: menu.items.map(item => ({
          ...item,
          food: item.foodId,
          foodId: item.foodId?._id
        }))
      };
    });

    const result = Object.values(grouped);

    if (!startDate) {
      await cacheService.setWeeklyMenu(result);
    }

    return result;
  }

  async getByDate(date) {
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);

    const menus = await MenuSchedule.find({
      date: { $gte: start, $lte: end },
      isActive: true
    })
      .populate({
        path: 'items.foodId',
        select: 'name slug description thumbnailImage pricing nutrition attributes isAvailable'
      })
      .lean();

    return menus.map(menu => ({
      ...menu,
      items: menu.items.map(item => ({
        ...item,
        food: item.foodId,
        foodId: item.foodId?._id
      }))
    }));
  }

  async findById(id) {
    const schedule = await MenuSchedule.findById(id)
      .populate({
        path: 'items.foodId',
        select: 'name slug description thumbnailImage pricing'
      })
      .lean();

    if (!schedule) {
      throw { statusCode: 404, code: 'ERR_SCHEDULE_NOT_FOUND', message: 'برنامه غذایی یافت نشد' };
    }

    return schedule;
  }

  async update(id, data) {
    const schedule = await MenuSchedule.findById(id);
    if (!schedule) {
      throw { statusCode: 404, code: 'ERR_SCHEDULE_NOT_FOUND', message: 'برنامه غذایی یافت نشد' };
    }

    // Validate food items if updating
    if (data.items) {
      const foodIds = data.items.map(item => item.foodId);
      const foods = await FoodItem.find({ _id: { $in: foodIds } });
      
      if (foods.length !== foodIds.length) {
        throw { statusCode: 400, code: 'ERR_INVALID_ITEMS', message: 'برخی از غذاها یافت نشدند' };
      }
    }

    if (data.date) {
      data.date = getStartOfDay(data.date);
    }

    Object.assign(schedule, data);
    await schedule.save();
    
    await cacheService.invalidateMenuCache();

    logger.info('برنامه غذایی ویرایش شد', { scheduleId: id });
    return schedule;
  }

  async delete(id) {
    const schedule = await MenuSchedule.findById(id);
    if (!schedule) {
      throw { statusCode: 404, code: 'ERR_SCHEDULE_NOT_FOUND', message: 'برنامه غذایی یافت نشد' };
    }

    await schedule.deleteOne();
    await cacheService.invalidateMenuCache();

    logger.info('برنامه غذایی حذف شد', { scheduleId: id });
    return { id };
  }

  async updateItemQuantity(scheduleId, foodId, quantity) {
    const schedule = await MenuSchedule.findById(scheduleId);
    if (!schedule) {
      throw { statusCode: 404, code: 'ERR_SCHEDULE_NOT_FOUND', message: 'برنامه غذایی یافت نشد' };
    }

    const item = schedule.items.find(i => i.foodId.toString() === foodId);
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_IN_MENU', message: 'این غذا در منو وجود ندارد' };
    }

    if (quantity > item.maxQuantity) {
      throw { statusCode: 400, code: 'ERR_QUANTITY_EXCEEDED', message: 'تعداد درخواستی بیش از حد مجاز است' };
    }

    item.remainingQuantity = quantity;
    await schedule.save();
    
    await cacheService.invalidateMenuCache();

    if (quantity === 0) {
      const food = await FoodItem.findById(foodId);
      await eventPublisher.publish('menu.item.out_of_stock', {
        scheduleId: schedule._id,
        itemId: foodId,
        name: food?.name,
        date: schedule.date,
        mealType: schedule.mealType
      });
    }

    return schedule;
  }

  async decrementQuantity(scheduleId, foodId, amount = 1) {
    const schedule = await MenuSchedule.findById(scheduleId);
    if (!schedule) {
      throw { statusCode: 404, code: 'ERR_SCHEDULE_NOT_FOUND', message: 'برنامه غذایی یافت نشد' };
    }

    const item = schedule.items.find(i => i.foodId.toString() === foodId);
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_IN_MENU', message: 'این غذا در منو وجود ندارد' };
    }

    if (item.remainingQuantity < amount) {
      throw { statusCode: 400, code: 'ERR_INSUFFICIENT_QUANTITY', message: 'موجودی کافی نیست' };
    }

    item.remainingQuantity -= amount;
    await schedule.save();
    
    await cacheService.invalidateMenuCache();

    return schedule;
  }
}

module.exports = new MenuScheduleService();
