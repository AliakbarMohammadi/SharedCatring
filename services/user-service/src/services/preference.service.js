const { preferenceRepository } = require('../repositories');
const logger = require('../utils/logger');

class PreferenceService {
  async getPreferences(userId) {
    let pref = await preferenceRepository.findByUserId(userId);
    if (!pref) {
      pref = await preferenceRepository.create({ userId });
      logger.info('تنظیمات پیش‌فرض ایجاد شد', { userId });
    }
    return this.format(pref);
  }

  async updatePreferences(userId, data) {
    let pref = await preferenceRepository.findByUserId(userId);
    if (!pref) {
      pref = await preferenceRepository.create({ userId, ...data });
    } else {
      pref = await preferenceRepository.update(userId, data);
    }
    logger.info('تنظیمات ویرایش شد', { userId });
    return this.format(pref);
  }

  async initializePreferences(userId) {
    const existing = await preferenceRepository.findByUserId(userId);
    if (existing) return this.format(existing);
    
    const pref = await preferenceRepository.create({ userId });
    logger.info('تنظیمات اولیه ایجاد شد', { userId });
    return this.format(pref);
  }

  format(pref) {
    return {
      id: pref.id,
      userId: pref.userId,
      dietaryRestrictions: pref.dietaryRestrictions,
      allergies: pref.allergies,
      favoriteFoods: pref.favoriteFoods,
      notificationSettings: pref.notificationSettings,
      language: pref.language,
      createdAt: pref.created_at,
      updatedAt: pref.updated_at
    };
  }
}

module.exports = new PreferenceService();
