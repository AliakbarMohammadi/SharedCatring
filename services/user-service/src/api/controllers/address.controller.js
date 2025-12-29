const { addressService } = require('../../services');

class AddressController {
  async getAddresses(req, res, next) {
    try {
      const addresses = await addressService.getAddresses(req.userId);
      res.json({ success: true, data: addresses, message: 'لیست آدرس‌ها' });
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req, res, next) {
    try {
      const address = await addressService.createAddress(req.userId, req.body);
      res.status(201).json({ success: true, data: address, message: 'آدرس با موفقیت ایجاد شد' });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const address = await addressService.updateAddress(req.userId, req.params.id, req.body);
      res.json({ success: true, data: address, message: 'آدرس با موفقیت ویرایش شد' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      await addressService.deleteAddress(req.userId, req.params.id);
      res.json({ success: true, data: null, message: 'آدرس با موفقیت حذف شد' });
    } catch (error) {
      next(error);
    }
  }

  async setDefaultAddress(req, res, next) {
    try {
      const address = await addressService.setDefaultAddress(req.userId, req.params.id);
      res.json({ success: true, data: address, message: 'آدرس پیش‌فرض تنظیم شد' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
