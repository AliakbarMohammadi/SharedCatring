const { roleService } = require('../../services');
const logger = require('../../utils/logger');

/**
 * Persian labels for system roles
 * برچسب‌های فارسی برای نقش‌های سیستم
 */
const ROLE_LABELS = {
  super_admin: 'مدیر کل',
  company_admin: 'مدیر شرکت',
  personal_user: 'کاربر عادی',
  kitchen_staff: 'کارمند آشپزخانه',
  employee: 'کارمند',
  corporate_user: 'کاربر سازمانی',
  catering_admin: 'مدیر کترینگ',
  admin: 'مدیر'
};

class RoleController {
  /**
   * Get system roles list with IDs (super_admin only)
   * GET /api/v1/identity/roles/list
   */
  async getSystemRoles(req, res, next) {
    try {
      logger.info('لیست نقش‌های سیستم درخواست شد', { userId: req.user?.userId });

      // Fetch roles from database
      const roles = await roleService.findAll();
      
      // Format with Persian labels
      const formattedRoles = roles.map(role => ({
        id: role.id,
        value: role.name,
        label: ROLE_LABELS[role.name] || role.description || role.name
      }));

      res.json({
        success: true,
        data: formattedRoles,
        message: 'لیست نقش‌های سیستم'
      });
    } catch (error) {
      next(error);
    }
  }

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
