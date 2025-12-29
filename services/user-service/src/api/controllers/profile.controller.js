const { profileService } = require('../../services');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const profile = await profileService.getProfile(req.userId);
      res.json({ success: true, data: profile, message: 'پروفایل کاربر' });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await profileService.updateProfile(req.userId, req.body);
      res.json({ success: true, data: profile, message: 'پروفایل با موفقیت ویرایش شد' });
    } catch (error) {
      next(error);
    }
  }

  async updateAvatar(req, res, next) {
    try {
      const profile = await profileService.updateAvatar(req.userId, req.body.avatarUrl);
      res.json({ success: true, data: profile, message: 'آواتار با موفقیت ویرایش شد' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
