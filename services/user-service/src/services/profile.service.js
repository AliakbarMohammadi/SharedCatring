const { profileRepository } = require('../repositories');
const logger = require('../utils/logger');

class ProfileService {
  async getProfile(userId) {
    let profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await profileRepository.create({ userId });
      logger.info('پروفایل جدید ایجاد شد', { userId });
    }
    return this.format(profile);
  }

  async updateProfile(userId, data) {
    let profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await profileRepository.create({ userId, ...data });
    } else {
      profile = await profileRepository.update(userId, data);
    }
    logger.info('پروفایل ویرایش شد', { userId });
    return this.format(profile);
  }

  async updateAvatar(userId, avatarUrl) {
    const profile = await this.updateProfile(userId, { avatarUrl });
    logger.info('آواتار ویرایش شد', { userId });
    return profile;
  }

  async initializeProfile(userId, data = {}) {
    const existing = await profileRepository.findByUserId(userId);
    if (existing) return this.format(existing);
    
    const profile = await profileRepository.create({ userId, ...data });
    logger.info('پروفایل اولیه ایجاد شد', { userId });
    return this.format(profile);
  }

  format(profile) {
    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      nationalCode: profile.nationalCode,
      avatarUrl: profile.avatarUrl,
      birthDate: profile.birthDate,
      gender: profile.gender,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  }
}

module.exports = new ProfileService();
