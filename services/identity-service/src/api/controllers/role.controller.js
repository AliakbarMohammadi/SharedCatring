const { roleService } = require('../../services');
const logger = require('../../utils/logger');

class RoleController {
  async create(req, res, next) {
    try {
      const role = await roleService.create(req.body);

      res.status(201).json({
        success: true,
        data: role,
        message: 'نقش با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const roles = await roleService.findAll();

      res.json({
        success: true,
        data: roles,
        message: 'لیست نقش‌ها'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const role = await roleService.findById(req.params.id);

      res.json({
        success: true,
        data: role,
        message: 'اطلاعات نقش'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const role = await roleService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: role,
        message: 'نقش با موفقیت ویرایش شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await roleService.delete(req.params.id);

      res.json({
        success: true,
        data: null,
        message: 'نقش با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async assignPermissions(req, res, next) {
    try {
      const role = await roleService.assignPermissions(req.params.id, req.body.permissionIds);

      res.json({
        success: true,
        data: role,
        message: 'دسترسی‌ها با موفقیت به نقش تخصیص داده شدند'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
