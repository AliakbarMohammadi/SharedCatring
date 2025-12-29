const { addressRepository } = require('../repositories');
const logger = require('../utils/logger');

class AddressService {
  async getAddresses(userId) {
    const addresses = await addressRepository.findByUserId(userId);
    return addresses.map(a => this.format(a));
  }

  async createAddress(userId, data) {
    if (data.isDefault) {
      await addressRepository.clearDefault(userId);
    }
    const address = await addressRepository.create({ userId, ...data });
    logger.info('آدرس جدید ایجاد شد', { userId, addressId: address.id });
    return this.format(address);
  }

  async updateAddress(userId, addressId, data) {
    const address = await addressRepository.findByIdAndUserId(addressId, userId);
    if (!address) {
      throw { statusCode: 404, code: 'ERR_ADDRESS_NOT_FOUND', message: 'آدرس یافت نشد' };
    }
    if (data.isDefault) {
      await addressRepository.clearDefault(userId);
    }
    const updated = await addressRepository.update(addressId, data);
    logger.info('آدرس ویرایش شد', { userId, addressId });
    return this.format(updated);
  }

  async deleteAddress(userId, addressId) {
    const address = await addressRepository.findByIdAndUserId(addressId, userId);
    if (!address) {
      throw { statusCode: 404, code: 'ERR_ADDRESS_NOT_FOUND', message: 'آدرس یافت نشد' };
    }
    await addressRepository.delete(addressId);
    logger.info('آدرس حذف شد', { userId, addressId });
    return { id: addressId };
  }

  async setDefaultAddress(userId, addressId) {
    const address = await addressRepository.findByIdAndUserId(addressId, userId);
    if (!address) {
      throw { statusCode: 404, code: 'ERR_ADDRESS_NOT_FOUND', message: 'آدرس یافت نشد' };
    }
    const updated = await addressRepository.setDefault(addressId, userId);
    logger.info('آدرس پیش‌فرض تنظیم شد', { userId, addressId });
    return this.format(updated);
  }

  format(address) {
    return {
      id: address.id,
      userId: address.userId,
      title: address.title,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      latitude: address.latitude ? parseFloat(address.latitude) : null,
      longitude: address.longitude ? parseFloat(address.longitude) : null,
      isDefault: address.isDefault,
      createdAt: address.created_at,
      updatedAt: address.updated_at
    };
  }
}

module.exports = new AddressService();
