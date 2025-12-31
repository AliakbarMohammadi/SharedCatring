const { Promotion } = require('../models');
const logger = require('../utils/logger');

class PromotionService {
  async create(data) {
    // Check for duplicate code
    const existing = await Promotion.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw { statusCode: 409, code: 'ERR_CODE_EXISTS', message: 'این کد تخفیف قبلاً ثبت شده است' };
    }

    const promotion = await Promotion.create(data);
    logger.info('تخفیف ایجاد شد', { promotionId: promotion._id, code: promotion.code });
    return promotion;
  }

  async findAll(options = {}) {
    const { page = 1, limit = 20, isActive, includeExpired = false } = options;

    const query = {};
    if (typeof isActive === 'boolean') query.isActive = isActive;
    
    if (!includeExpired) {
      query.endDate = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;

    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Promotion.countDocuments(query)
    ]);

    return {
      promotions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    const promotion = await Promotion.findById(id).lean();
    if (!promotion) {
      throw { statusCode: 404, code: 'ERR_PROMOTION_NOT_FOUND', message: 'تخفیف یافت نشد' };
    }
    return promotion;
  }

  async findByCode(code) {
    const promotion = await Promotion.findOne({ code: code.toUpperCase() });
    if (!promotion) {
      throw { statusCode: 404, code: 'ERR_PROMOTION_NOT_FOUND', message: 'کد تخفیف یافت نشد' };
    }
    return promotion;
  }

  async update(id, data) {
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      throw { statusCode: 404, code: 'ERR_PROMOTION_NOT_FOUND', message: 'تخفیف یافت نشد' };
    }

    // Check code uniqueness if changing
    if (data.code && data.code.toUpperCase() !== promotion.code) {
      const existing = await Promotion.findOne({ code: data.code.toUpperCase() });
      if (existing) {
        throw { statusCode: 409, code: 'ERR_CODE_EXISTS', message: 'این کد تخفیف قبلاً ثبت شده است' };
      }
    }

    Object.assign(promotion, data);
    await promotion.save();

    logger.info('تخفیف ویرایش شد', { promotionId: id });
    return promotion;
  }

  async delete(id) {
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      throw { statusCode: 404, code: 'ERR_PROMOTION_NOT_FOUND', message: 'تخفیف یافت نشد' };
    }

    await promotion.deleteOne();
    logger.info('تخفیف حذف شد', { promotionId: id });
    return { id };
  }

  async validate(code, orderData) {
    const promotion = await this.findByCode(code);

    // Check if promotion is valid
    if (!promotion.isValid()) {
      throw { statusCode: 400, code: 'ERR_PROMOTION_INVALID', message: 'کد تخفیف معتبر نیست یا منقضی شده است' };
    }

    const { orderAmount, items = [], categoryIds = [] } = orderData;

    // Check minimum order amount
    if (orderAmount < promotion.minOrderAmount) {
      throw {
        statusCode: 400,
        code: 'ERR_MIN_ORDER_NOT_MET',
        message: `حداقل مبلغ سفارش برای استفاده از این کد ${promotion.minOrderAmount.toLocaleString('fa-IR')} تومان است`
      };
    }

    // Check applicable items/categories
    if (promotion.applicableItems.length > 0) {
      const hasApplicableItem = items.some(itemId => 
        promotion.applicableItems.some(ai => ai.toString() === itemId)
      );
      if (!hasApplicableItem) {
        throw { statusCode: 400, code: 'ERR_ITEMS_NOT_APPLICABLE', message: 'این کد تخفیف برای آیتم‌های انتخابی قابل استفاده نیست' };
      }
    }

    if (promotion.applicableCategories.length > 0) {
      const hasApplicableCategory = categoryIds.some(catId =>
        promotion.applicableCategories.some(ac => ac.toString() === catId)
      );
      if (!hasApplicableCategory) {
        throw { statusCode: 400, code: 'ERR_CATEGORIES_NOT_APPLICABLE', message: 'این کد تخفیف برای دسته‌بندی‌های انتخابی قابل استفاده نیست' };
      }
    }

    // Calculate discount
    const discount = promotion.calculateDiscount(orderAmount);

    return {
      valid: true,
      promotion: {
        id: promotion._id,
        code: promotion.code,
        name: promotion.name,
        type: promotion.type,
        value: promotion.value
      },
      discount,
      finalAmount: orderAmount - discount
    };
  }

  async incrementUsage(id) {
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      throw { statusCode: 404, code: 'ERR_PROMOTION_NOT_FOUND', message: 'تخفیف یافت نشد' };
    }

    promotion.usedCount += 1;
    await promotion.save();

    return promotion;
  }
}

module.exports = new PromotionService();
