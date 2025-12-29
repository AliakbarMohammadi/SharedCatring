const { profileService, preferenceService } = require('../../services');
const logger = require('../../utils/logger');

const handleUserCreated = async (message) => {
  try {
    const { userId, email, firstName, lastName } = message;
    
    logger.info('رویداد ایجاد کاربر دریافت شد', { userId, email });

    // Initialize profile
    await profileService.initializeProfile(userId, { firstName, lastName });
    
    // Initialize preferences
    await preferenceService.initializePreferences(userId);

    logger.info('پروفایل و تنظیمات کاربر ایجاد شد', { userId });
  } catch (error) {
    logger.error('خطا در پردازش رویداد ایجاد کاربر', { error: error.message, message });
  }
};

module.exports = { handleUserCreated };
