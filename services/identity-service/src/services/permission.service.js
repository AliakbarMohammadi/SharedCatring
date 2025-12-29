const { Permission } = require('../models');
const logger = require('../utils/logger');

class PermissionService {
  async create(permissionData) {
    const { name, resource, action, description } = permissionData;

    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      throw { statusCode: 409, code: 'ERR_PERMISSION_EXISTS', message: 'این دسترسی قبلاً ایجاد شده است' };
    }

    const permission = await Permission.create({ name, resource, action, description });

    logger.info('دسترسی جدید ایجاد شد', { permissionId: permission.id, name: permission.name });

    return this.formatPermission(permission);
  }

  async findAll(options = {}) {
    const { resource } = options;
    
    const where = {};
    if (resource) where.resource = resource;

    const permissions = await Permission.findAll({
      where,
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });

    return permissions.map(p => this.formatPermission(p));
  }

  async findById(id) {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      throw { statusCode: 404, code: 'ERR_PERMISSION_NOT_FOUND', message: 'دسترسی یافت نشد' };
    }

    return this.formatPermission(permission);
  }

  formatPermission(permission) {
    return {
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      createdAt: permission.created_at
    };
  }
}

module.exports = new PermissionService();
