const { User } = require('../../models');
const logger = require('../../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('شروع ایجاد داده‌های اولیه user-service');

    // Create super admin user
    const [user, created] = await User.findOrCreate({
      where: { email: 'superadmin@catering.com' },
      defaults: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'superadmin@catering.com',
        phone: '09100000000',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        status: 'active'
      }
    });

    if (created) {
      logger.info(`کاربر ایجاد شد: ${user.firstName} ${user.lastName} (${user.email})`);
    } else {
      // Update existing user to ensure it has correct role and status
      await user.update({ role: 'super_admin', status: 'active' });
      logger.info(`کاربر به‌روزرسانی شد: ${user.email}`);
    }

    logger.info('داده‌های اولیه user-service با موفقیت ایجاد شدند');
  } catch (error) {
    logger.error('خطا در ایجاد داده‌های اولیه user-service', { error: error.message });
    // Don't throw - let service continue
  }
};

module.exports = { seedDatabase };