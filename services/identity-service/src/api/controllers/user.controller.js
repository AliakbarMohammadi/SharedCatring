const { userService } = require('../../services');
const logger = require('../../utils/logger');

class UserController {
  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);

      res.status(201).json({
        success: true,
        data: user,
        message: 'کاربر با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, status, roleId, search } = req.query;
      
      const result = await userService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        roleId,
        search
      });

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
        message: 'لیست کاربران'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const user = await userService.findById(req.params.id);

      res.json({
        success: true,
        data: user,
        message: 'اطلاعات کاربر'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: user,
        message: 'کاربر با موفقیت ویرایش شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const user = await userService.updateStatus(req.params.id, req.body.status);

      res.json({
        success: true,
        data: user,
        message: 'وضعیت کاربر با موفقیت تغییر کرد'
      });
    } catch (error) {
      next(error);
    }
  }

  async assignRole(req, res, next) {
    try {
      const user = await userService.assignRole(req.params.id, req.body.roleId);

      res.json({
        success: true,
        data: user,
        message: 'نقش با موفقیت به کاربر تخصیص داده شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async findByEmailInternal(req, res, next) {
    try {
      const { email } = req.params;
      const user = await userService.findByEmailWithPassword(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_USER_NOT_FOUND', message: 'کاربر یافت نشد' }
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'اطلاعات کاربر'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id);

      res.json({
        success: true,
        data: null,
        message: 'کاربر با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const { passwordHash } = req.body;
      await userService.updatePassword(req.params.id, passwordHash);

      res.json({
        success: true,
        data: null,
        message: 'رمز عبور با موفقیت تغییر کرد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
