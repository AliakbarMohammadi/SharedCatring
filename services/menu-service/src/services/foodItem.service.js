const { FoodItem, Category } = require('../models');
const cacheService = require('./cache.service');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');

class FoodItemService {
  async create(data) {
    // Validate category
    const category = await Category.findById(data.categoryId);
    if (!category) {
      throw { statusCode: 404, code: 'ERR_CATEGORY_NOT_FOUND', message: 'دسته‌بندی یافت نشد' };
    }

    const foodItem = await FoodItem.create(data);
    
    await eventPublisher.publish('menu.item.created', {
      itemId: foodItem._id,
      name: foodItem.name,
      categoryId: foodItem.categoryId,
      price: foodItem.pricing.basePrice
    });

    logger.info('غذا ایجاد شد', { itemId: foodItem._id, name: foodItem.name });
    return foodItem;
  }

  async findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      categoryId,
      isAvailable,
      isFeatured,
      minPrice,
      maxPrice,
      search,
      tags,
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = options;

    const query = {};

    if (categoryId) query.categoryId = categoryId;
    if (typeof isAvailable === 'boolean') query.isAvailable = isAvailable;
    if (typeof isFeatured === 'boolean') query.isFeatured = isFeatured;
    
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = minPrice;
      if (maxPrice) query['pricing.basePrice'].$lte = maxPrice;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      FoodItem.find(query)
        .populate('categoryId', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      FoodItem.countDocuments(query)
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    // Try cache first
    const cached = await cacheService.getFood(id);
    if (cached) return cached;

    const item = await FoodItem.findById(id)
      .populate('categoryId', 'name slug')
      .lean();

    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }

    await cacheService.setFood(id, item);
    return item;
  }

  async findBySlug(slug) {
    const item = await FoodItem.findOne({ slug })
      .populate('categoryId', 'name slug')
      .lean();

    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }

    return item;
  }

  async update(id, data) {
    const item = await FoodItem.findById(id);
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }

    // Validate category if changing
    if (data.categoryId && data.categoryId !== item.categoryId.toString()) {
      const category = await Category.findById(data.categoryId);
      if (!category) {
        throw { statusCode: 404, code: 'ERR_CATEGORY_NOT_FOUND', message: 'دسته‌بندی یافت نشد' };
      }
    }

    Object.assign(item, data);
    await item.save();
    
    await cacheService.invalidateFood(id);
    await cacheService.invalidateMenuCache();

    await eventPublisher.publish('menu.item.updated', {
      itemId: item._id,
      name: item.name,
      changes: Object.keys(data)
    });

    logger.info('غذا ویرایش شد', { itemId: id });
    return item;
  }

  async delete(id) {
    const item = await FoodItem.findById(id);
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }

    await item.deleteOne();
    await cacheService.invalidateFood(id);
    await cacheService.invalidateMenuCache();

    logger.info('غذا حذف شد', { itemId: id });
    return { id };
  }

  async updateAvailability(id, isAvailable) {
    const item = await FoodItem.findById(id);
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }

    item.isAvailable = isAvailable;
    await item.save();
    
    await cacheService.invalidateFood(id);
    await cacheService.invalidateMenuCache();

    if (!isAvailable) {
      await eventPublisher.publish('menu.item.out_of_stock', {
        itemId: item._id,
        name: item.name
      });
    }

    logger.info('موجودی غذا تغییر کرد', { itemId: id, isAvailable });
    return item;
  }

  async getNutrition(id) {
    const item = await FoodItem.findById(id).select('name nutrition').lean();
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }
    return { name: item.name, nutrition: item.nutrition };
  }

  async getPopular(limit = 10) {
    return FoodItem.find({ isAvailable: true })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean();
  }

  async getFeatured(limit = 10) {
    return FoodItem.find({ isAvailable: true, isFeatured: true })
      .sort({ sortOrder: 1 })
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean();
  }

  // Pricing methods
  async getPrices(id) {
    const item = await FoodItem.findById(id).select('name pricing').lean();
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }
    return { name: item.name, pricing: item.pricing };
  }

  async updatePrices(id, pricing) {
    const item = await FoodItem.findById(id);
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }

    item.pricing = { ...item.pricing, ...pricing };
    await item.save();
    
    await cacheService.invalidateFood(id);
    await cacheService.invalidateMenuCache();

    logger.info('قیمت غذا ویرایش شد', { itemId: id });
    return item;
  }

  async addCorporatePrice(id, corporatePrice) {
    const item = await FoodItem.findById(id);
    if (!item) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'غذا یافت نشد' };
    }

    // Check if company price already exists
    const existingIndex = item.pricing.corporatePrices.findIndex(
      cp => cp.companyId === corporatePrice.companyId
    );

    if (existingIndex >= 0) {
      item.pricing.corporatePrices[existingIndex] = corporatePrice;
    } else {
      item.pricing.corporatePrices.push(corporatePrice);
    }

    await item.save();
    await cacheService.invalidateFood(id);

    logger.info('قیمت سازمانی اضافه شد', { itemId: id, companyId: corporatePrice.companyId });
    return item;
  }
}

module.exports = new FoodItemService();
