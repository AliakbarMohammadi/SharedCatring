const userService = require('../../services/userService');

class UserController {
  async getStats(req, res, next) {
    try {
      const stats = await userService.getUserStats();
      
      res.json({
        success: true,
        data: stats,
        message: 'آمار کاربران با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'کاربر با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      
      res.json({
        success: true,
        data: user,
        message: 'اطلاعات با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, status, role, companyId, search } = req.query;
      const result = await userService.getUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        role,
        companyId,
        search
      });

      res.json({
        success: true,
        data: result.users,
        message: 'اطلاعات با موفقیت دریافت شد',
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const { page, limit, status, role, search } = req.query;
      
      const result = await userService.getUsersByCompany(companyId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        role,
        search
      });

      res.json({
        success: true,
        data: result.users,
        message: 'اطلاعات با موفقیت دریافت شد',
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      
      res.json({
        success: true,
        data: user,
        message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await userService.updateUserStatus(req.params.id, status);
      
      res.json({
        success: true,
        data: user,
        message: 'وضعیت کاربر با موفقیت تغییر کرد'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      
      res.json({
        success: true,
        data: null,
        message: 'کاربر با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.id;
      const user = await userService.updatePreferences(userId, req.body);
      
      res.json({
        success: true,
        data: user,
        message: 'تنظیمات با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async assignToCompany(req, res, next) {
    try {
      const { companyId, role } = req.body;
      const user = await userService.assignToCompany(req.params.id, companyId, role);
      
      res.json({
        success: true,
        data: user,
        message: 'کاربر با موفقیت به شرکت اضافه شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
