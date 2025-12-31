const { foodItemService } = require('../../services');

class FoodItemController {
  async create(req, res, next) {
    try {
      const item = await foodItemService.create(req.body);

      res.status(201).json({
        success: true,
        data: item,
        message: 'غذا با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const {
        page,
        limit,
        categoryId,
        isAvailable,
        isFeatured,
        minPrice,
        maxPrice,
        search,
        tags,
        sortBy,
        sortOrder
      } = req.query;

      const result = await foodItemService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        categoryId,
        isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
        isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        search,
        tags: tags ? tags.split(',') : undefined,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        message: 'لیست غذاها'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const item = await foodItemService.findById(req.params.id);

      res.json({
        success: true,
        data: item,
        message: 'اطلاعات غذا'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const item = await foodItemService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: item,
        message: 'غذا با موفقیت ویرایش شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await foodItemService.delete(req.params.id);

      res.json({
        success: true,
        data: null,
        message: 'غذا با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAvailability(req, res, next) {
    try {
      const item = await foodItemService.updateAvailability(req.params.id, req.body.isAvailable);

      res.json({
        success: true,
        data: item,
        message: req.body.isAvailable ? 'غذا موجود شد' : 'غذا ناموجود شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getNutrition(req, res, next) {
    try {
      const nutrition = await foodItemService.getNutrition(req.params.id);

      res.json({
        success: true,
        data: nutrition,
        message: 'اطلاعات تغذیه‌ای'
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopular(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const items = await foodItemService.getPopular(limit);

      res.json({
        success: true,
        data: items,
        message: 'غذاهای محبوب'
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const items = await foodItemService.getFeatured(limit);

      res.json({
        success: true,
        data: items,
        message: 'غذاهای ویژه'
      });
    } catch (error) {
      next(error);
    }
  }

  async getPrices(req, res, next) {
    try {
      const prices = await foodItemService.getPrices(req.params.id);

      res.json({
        success: true,
        data: prices,
        message: 'قیمت‌های غذا'
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePrices(req, res, next) {
    try {
      const item = await foodItemService.updatePrices(req.params.id, req.body);

      res.json({
        success: true,
        data: item,
        message: 'قیمت‌ها با موفقیت ویرایش شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async addCorporatePrice(req, res, next) {
    try {
      const item = await foodItemService.addCorporatePrice(req.params.id, req.body);

      res.json({
        success: true,
        data: item,
        message: 'قیمت سازمانی با موفقیت اضافه شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FoodItemController();
