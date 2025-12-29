const User = require('../models/User');
const { Op } = require('sequelize');

class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findById(id) {
    return User.findByPk(id);
  }

  async findByEmail(email) {
    return User.findOne({ where: { email: email.toLowerCase() } });
  }

  async findByCompany(companyId, options = {}) {
    const { page = 1, limit = 10, status, role, search } = options;
    const offset = (page - 1) * limit;

    const where = { companyId };
    
    if (status) where.status = status;
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      page,
      limit
    };
  }

  async findAll(options = {}) {
    const { page = 1, limit = 10, status, role, companyId, search } = options;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (status) where.status = status;
    if (role) where.role = role;
    if (companyId) where.companyId = companyId;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      page,
      limit
    };
  }

  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data);
  }

  async updateStatus(id, status) {
    return User.update({ status }, { where: { id } });
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.destroy(); // Soft delete
    return user;
  }

  async restore(id) {
    const user = await User.findByPk(id, { paranoid: false });
    if (!user) return null;
    await user.restore();
    return user;
  }

  async countByCompany(companyId) {
    return User.count({ where: { companyId } });
  }

  async countByStatus(status) {
    return User.count({ where: { status } });
  }
}

module.exports = new UserRepository();
