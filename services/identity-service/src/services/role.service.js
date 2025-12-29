const { Role, Permission, RolePermission, User } = require('../models');
const logger = require('../utils/logger');

class RoleService {
  async create(roleData) {
    const { name, description, isSystem = false } = roleData;

    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      throw { statusCode: 409, code: 'ERR_ROLE_EXISTS', message: 'این نقش قبلاً ایجاد شده است' };
    }

    const role = await Role.create({ name, description, isSystem });

    logger.info('نقش جدید ایجاد شد', { roleId: role.id, name: role.name });

    return this.formatRole(role);
  }

  async findAll() {
    const roles = await Role.findAll({
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      order: [['created_at', 'ASC']]
    });

    return roles.map(role => this.formatRole(role));
  }

  async findById(id) {
    const role = await Role.findByPk(id, {
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
    });

    if (!role) {
      throw { statusCode: 404, code: 'ERR_ROLE_NOT_FOUND', message: 'نقش یافت نشد' };
    }

    return this.formatRole(role);
  }

  async findByName(name) {
    const role = await Role.findOne({
      where: { name },
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
    });
    return role;
  }

  async update(id, updateData) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw { statusCode: 404, code: 'ERR_ROLE_NOT_FOUND', message: 'نقش یافت نشد' };
    }

    if (role.isSystem) {
      throw { statusCode: 403, code: 'ERR_SYSTEM_ROLE', message: 'نقش‌های سیستمی قابل ویرایش نیستند' };
    }

    const { name, description } = updateData;

    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        throw { statusCode: 409, code: 'ERR_ROLE_EXISTS', message: 'این نام نقش قبلاً استفاده شده است' };
      }
    }

    await role.update({ name, description });

    logger.info('نقش ویرایش شد', { roleId: role.id });

    return this.formatRole(role);
  }

  async delete(id) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw { statusCode: 404, code: 'ERR_ROLE_NOT_FOUND', message: 'نقش یافت نشد' };
    }

    if (role.isSystem) {
      throw { statusCode: 403, code: 'ERR_SYSTEM_ROLE', message: 'نقش‌های سیستمی قابل حذف نیستند' };
    }

    // Check if role is assigned to users
    const usersWithRole = await User.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      throw { statusCode: 400, code: 'ERR_ROLE_IN_USE', message: 'این نقش به کاربرانی تخصیص داده شده و قابل حذف نیست' };
    }

    await role.destroy();

    logger.info('نقش حذف شد', { roleId: id });

    return { id };
  }

  async assignPermissions(roleId, permissionIds) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw { statusCode: 404, code: 'ERR_ROLE_NOT_FOUND', message: 'نقش یافت نشد' };
    }

    // Validate all permissions exist
    const permissions = await Permission.findAll({
      where: { id: permissionIds }
    });

    if (permissions.length !== permissionIds.length) {
      throw { statusCode: 400, code: 'ERR_INVALID_PERMISSIONS', message: 'برخی از دسترسی‌ها نامعتبر هستند' };
    }

    // Remove existing permissions and add new ones
    await RolePermission.destroy({ where: { roleId } });
    
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId
    }));
    
    await RolePermission.bulkCreate(rolePermissions);

    logger.info('دسترسی‌ها به نقش تخصیص داده شدند', { roleId, permissionCount: permissionIds.length });

    return this.findById(roleId);
  }

  formatRole(role) {
    const formatted = {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.created_at
    };

    if (role.permissions) {
      formatted.permissions = role.permissions.map(p => ({
        id: p.id,
        name: p.name,
        resource: p.resource,
        action: p.action,
        description: p.description
      }));
    }

    return formatted;
  }
}

module.exports = new RoleService();
