const { categoryService } = require('../../services');

class CategoryController {
  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body);

      res.status(201).json({
        success: true,
        data: category,
        message: 'دسته‌بندی با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { includeInactive, parentId } = req.query;
      
      const categories = await categoryService.findAll({
        includeInactive: includeInactive === 'true',
        parentId: parentId === 'null' ? null : parentId
      });

      res.json({
        success: true,
        data: categories,
        message: 'لیست دسته‌بندی‌ها'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const category = await categoryService.findById(req.params.id);

      res.json({
        success: true,
        data: category,
        message: 'اطلاعات دسته‌بندی'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await categoryService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: category,
        message: 'دسته‌بندی با موفقیت ویرایش شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await categoryService.delete(req.params.id);

      res.json({
        success: true,
        data: null,
        message: 'دسته‌بندی با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req, res, next) {
    try {
      const category = await categoryService.updateOrder(req.params.id, req.body.order);

      res.json({
        success: true,
        data: category,
        message: 'ترتیب دسته‌بندی با موفقیت تغییر کرد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTree(req, res, next) {
    try {
      const tree = await categoryService.getTree();

      res.json({
        success: true,
        data: tree,
        message: 'درخت دسته‌بندی‌ها'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
