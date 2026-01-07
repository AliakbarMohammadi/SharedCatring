const { Company, DeliveryShift, SubsidyRule } = require('../../models');
const logger = require('../../utils/logger');

// Placeholder UUID for seed data - should be replaced with actual admin user
const SEED_ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001';

const seedDatabase = async () => {
  try {
    logger.info('شروع ایجاد داده‌های اولیه company-service');

    // Create default company
    const [company, created] = await Company.findOrCreate({
      where: { name: 'شرکت نمونه کترینگ' },
      defaults: {
        name: 'شرکت نمونه کترینگ',
        email: 'info@sample-catering.ir',
        phone: '02188776655',
        address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
        city: 'تهران',
        status: 'active',
        adminUserId: SEED_ADMIN_USER_ID
      }
    });

    if (created) {
      logger.info(`شرکت ایجاد شد: ${company.name}`);

      // Create delivery shifts
      const shifts = [
        { name: 'شیفت صبح', startTime: '08:00', endTime: '12:00', isActive: true },
        { name: 'شیفت عصر', startTime: '12:00', endTime: '18:00', isActive: true }
      ];

      for (const shiftData of shifts) {
        await DeliveryShift.findOrCreate({
          where: { name: shiftData.name, companyId: company.id },
          defaults: { ...shiftData, companyId: company.id }
        });
        logger.info(`شیفت تحویل ایجاد شد: ${shiftData.name}`);
      }
    } else {
      logger.info(`شرکت قبلاً وجود دارد: ${company.name}`);
    }

    logger.info('داده‌های اولیه company-service با موفقیت ایجاد شدند');
  } catch (error) {
    logger.error('خطا در ایجاد داده‌های اولیه company-service', { error: error.message });
    // Don't throw - let service continue
  }
};

module.exports = { seedDatabase };
