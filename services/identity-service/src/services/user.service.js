const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class UserService {
  async create(userData) {
    const { email, phone, password, passwordHash: providedHash, firstName, lastName, roleId, role: roleName, companyId } = userData;

    // Check if email exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw { statusCode: 409, code: 'ERR_EMAIL_EXISTS', message: 'این ایمیل قبلاً ثبت شده است' };
    }

    // Check if phone exists
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        throw { statusCode: 409, code: 'ERR_PHONE_EXISTS', message: 'این شماره موبایل قبلاً ثبت شده است' };
      }
    }

    // Resolve roleId from roleName if provided
    let finalRoleId = roleId;
    if (!finalRoleId && roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        finalRoleId = role.id;
      }
    }

    // Validate role if provided
    if (finalRoleId) {
      const role = await Role.findByPk(finalRoleId);
      if (!role) {
        throw { statusCode: 404, code: 'ERR_ROLE_NOT_FOUND', message: 'نقش مورد نظر یافت نشد' };
      }
    }

    // Use provided hash or hash the password
    let finalPasswordHash;
    if (providedHash) {
      finalPasswordHash = providedHash; // Pre-hashed from auth-service
    } else if (password && password.startsWith('$2')) {
      finalPasswordHash = password; // Already hashed
    } else if (password) {
      finalPasswordHash = await bcrypt.hash(password, 12);
    } else {
      throw { statusCode: 400, code: 'ERR_PASSWORD_REQUIRED', message: 'رمز عبور الزامی است' };
    }

    const user = await User.create({
      email,
      phone,
      passwordHash: finalPasswordHash,
      firstName,
      lastName,
      roleId: finalRoleId,
      companyId,
      status: 'pending'
    });

    // Publish event
    await eventPublisher.publish('identity.user.created', {
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    });

    logger.info('کاربر جدید ایجاد شد', { userId: user.id, email: user.email });

    return this.formatUser(user);
  }

  async findAll(options = {}) {
    const { page = 1, limit = 20, status, roleId, search } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (roleId) where.roleId = roleId;
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'description'] }],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      users: rows.map(user => this.formatUser(user)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async findById(id) {
    const user = await User.findByPk(id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'description'] }]
    });

    if (!user) {
      throw { statusCode: 404, code: 'ERR_USER_NOT_FOUND', message: 'کاربر یافت نشد' };
    }

    return this.formatUser(user);
  }

  async findByEmail(email) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });
    return user;
  }

  async findByEmailWithPassword(email) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      status: user.status,
      companyId: user.companyId,
      role: user.role ? { id: user.role.id, name: user.role.name } : null
    };
  }

  async update(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw { statusCode: 404, code: 'ERR_USER_NOT_FOUND', message: 'کاربر یافت نشد' };
    }

    const { email, phone, firstName, lastName, companyId } = updateData;

    // Check email uniqueness
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw { statusCode: 409, code: 'ERR_EMAIL_EXISTS', message: 'این ایمیل قبلاً ثبت شده است' };
      }
    }

    // Check phone uniqueness
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        throw { statusCode: 409, code: 'ERR_PHONE_EXISTS', message: 'این شماره موبایل قبلاً ثبت شده است' };
      }
    }

    await user.update({ email, phone, firstName, lastName, companyId });

    // Publish event
    await eventPublisher.publish('identity.user.updated', {
      userId: user.id,
      changes: updateData
    });

    logger.info('کاربر ویرایش شد', { userId: user.id });

    return this.formatUser(user);
  }

  async updateStatus(id, status) {
    const user = await User.findByPk(id);
    if (!user) {
      throw { statusCode: 404, code: 'ERR_USER_NOT_FOUND', message: 'کاربر یافت نشد' };
    }

    await user.update({ status });

    await eventPublisher.publish('identity.user.updated', {
      userId: user.id,
      changes: { status }
    });

    logger.info('وضعیت کاربر تغییر کرد', { userId: user.id, status });

    return this.formatUser(user);
  }

  async assignRole(userId, roleId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { statusCode: 404, code: 'ERR_USER_NOT_FOUND', message: 'کاربر یافت نشد' };
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      throw { statusCode: 404, code: 'ERR_ROLE_NOT_FOUND', message: 'نقش یافت نشد' };
    }

    await user.update({ roleId });

    await eventPublisher.publish('identity.role.assigned', {
      userId: user.id,
      roleId: role.id,
      roleName: role.name
    });

    logger.info('نقش به کاربر تخصیص داده شد', { userId: user.id, roleId: role.id });

    return this.formatUser(await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }]
    }));
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw { statusCode: 404, code: 'ERR_USER_NOT_FOUND', message: 'کاربر یافت نشد' };
    }

    await user.destroy();

    await eventPublisher.publish('identity.user.deleted', { userId: id });

    logger.info('کاربر حذف شد', { userId: id });

    return { id };
  }

  async updatePassword(id, passwordHash) {
    const user = await User.findByPk(id);
    if (!user) {
      throw { statusCode: 404, code: 'ERR_USER_NOT_FOUND', message: 'کاربر یافت نشد' };
    }

    await user.update({ passwordHash });
    logger.info('رمز عبور کاربر تغییر کرد', { userId: id });
  }

  formatUser(user) {
    const formatted = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      companyId: user.companyId,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    if (user.role) {
      formatted.role = {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description
      };
    }

    return formatted;
  }
}

module.exports = new UserService();
