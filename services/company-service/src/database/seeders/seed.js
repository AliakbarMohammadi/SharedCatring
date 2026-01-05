const { Company, Department, DeliveryShift, SubsidyRule } = require('../../models');
const logger = require('../../utils/logger');

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
        status: 'active'
      }
    });

    if (created) {
      logger.info(`شرکت ایجاد شد: ${company.name}`);

      // Create departments
      const departments = [
        { name: 'مدیریت', description: 'بخش مدیریت و اداری', isActive: true },
        { name: 'فناوری اطلاعات', description: 'بخش IT', isActive: true },
        { name: 'منابع انسانی', description: 'بخش منابع انسانی', isActive: true }
      ];

      for (const deptData of departments) {
        await Department.findOrCreate({
          where: { name: deptData.name, companyId: company.id },
          defaults: { ...deptData, companyId: company.id }
        });
        logger.info(`بخش ایجاد شد: ${deptData.name}`);
      }

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