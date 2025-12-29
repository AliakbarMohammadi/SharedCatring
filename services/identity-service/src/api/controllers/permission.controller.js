const { permissionService } = require('../../services');

class PermissionController {
  async findAll(req, res, next) {
    try {
      const { resource } = req.query;
      const permissions = await permissionService.findAll({ resource });

      res.json({
        success: true,
        data: permissions,
        message: 'لیست دسترسی‌ها'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermissionController();
