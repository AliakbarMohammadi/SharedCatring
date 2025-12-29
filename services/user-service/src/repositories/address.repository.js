const { UserAddress } = require('../models');

class AddressRepository {
  async findByUserId(userId) {
    return UserAddress.findAll({ where: { userId }, order: [['is_default', 'DESC'], ['created_at', 'DESC']] });
  }

  async findById(id) {
    return UserAddress.findByPk(id);
  }

  async findByIdAndUserId(id, userId) {
    return UserAddress.findOne({ where: { id, userId } });
  }

  async create(data) {
    return UserAddress.create(data);
  }

  async update(id, data) {
    const address = await this.findById(id);
    if (!address) return null;
    return address.update(data);
  }

  async delete(id) {
    const address = await this.findById(id);
    if (!address) return null;
    await address.destroy();
    return address;
  }

  async clearDefault(userId) {
    await UserAddress.update({ isDefault: false }, { where: { userId } });
  }

  async setDefault(id, userId) {
    await this.clearDefault(userId);
    return this.update(id, { isDefault: true });
  }
}

module.exports = new AddressRepository();
