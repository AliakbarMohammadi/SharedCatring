const { preferenceService } = require('../../services');

class PreferenceController {
  async getPreferences(req, res, next) {
    try {
      const preferences = await preferenceService.getPreferences(req.userId);
      res.json({ success: true, data: preferences, message: 'تنظیمات کاربر' });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const preferences = await preferenceService.updatePreferences(req.userId, req.body);
      res.json({ success: true, data: preferences, message: 'تنظیمات با موفقیت ویرایش شد' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PreferenceController();
