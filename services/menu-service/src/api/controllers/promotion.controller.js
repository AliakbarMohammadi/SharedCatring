const { promotionService } = require('../../services');

class PromotionController {
  async create(req, res, next) {
    try {
      const promotion = await promotionService.create(req.body);

      res.status(201).json({
        success: true,
        data: promotion,
        message: 'تخفیف با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, isActive, includeExpired } = req.query;

      const result = await promotionService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        includeExpired: includeExpired === 'true'
      });

      res.json({
        success: true,
        data: result.promotions,
        pagination: result.pagination,
        message: 'لیست تخفیف‌ها'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const promotion = await promotionService.findById(req.params.id);

      res.json({
        success: true,
        data: promotion,
        message: 'اطلاعات تخفیف'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const promotion = await promotionService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: promotion,
        message: 'تخفیف با موفقیت ویرایش شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await promotionService.delete(req.params.id);

      res.json({
        success: true,
        data: null,
        message: 'تخفیف با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async validate(req, res, next) {
    try {
      const result = await promotionService.validate(req.body.code, {
        orderAmount: req.body.orderAmount,
        items: req.body.items,
        categoryIds: req.body.categoryIds
      });

      res.json({
        success: true,
        data: result,
        message: 'کد تخفیف معتبر است'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionController();
