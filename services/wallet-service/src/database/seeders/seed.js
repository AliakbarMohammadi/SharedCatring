const { Wallet, WalletTransaction } = require('../../models');
const logger = require('../../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('شروع ایجاد داده‌های اولیه wallet-service');

    // Create super admin wallet
    const superAdminUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    const [wallet, created] = await Wallet.findOrCreate({
      where: { userId: superAdminUserId },
      defaults: {
        userId: superAdminUserId,
        personalBalance: 1000000000,
        companyBalance: 0,
        isActive: true
      }
    });
    
    if (created) {
      logger.info(`کیف پول ایجاد شد برای کاربر: ${wallet.userId}`);
      
      // Create initial transaction
      await WalletTransaction.create({
        walletId: wallet.id,
        type: 'topup_personal',
        balanceType: 'personal',
        amount: 1000000000,
        balanceBefore: 0,
        balanceAfter: 1000000000,
        description: 'موجودی اولیه حساب',
        referenceType: 'system',
        metadata: {
          source: 'system',
          reason: 'initial_setup'
        }
      });
      
      logger.info(`تراکنش اولیه ایجاد شد برای کیف پول: ${wallet.id}`);
    } else {
      logger.info(`کیف پول قبلاً وجود دارد برای کاربر: ${superAdminUserId}`);
    }

    logger.info('داده‌های اولیه wallet-service با موفقیت ایجاد شدند');
  } catch (error) {
    logger.error('خطا در ایجاد داده‌های اولیه wallet-service', { error: error.message });
    // Don't throw - let service continue
  }
};

module.exports = { seedDatabase };