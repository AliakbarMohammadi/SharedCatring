const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { sequelize } = require('../config/database');

class WalletService {
  async createWallet(userId, companyId = null) {
    const existing = await Wallet.findOne({ where: { userId } });
    if (existing) {
      const error = new Error('کیف پول قبلاً ایجاد شده است');
      error.statusCode = 409;
      error.errorCode = 'ERR_1701';
      throw error;
    }
    return Wallet.create({ userId, companyId });
  }

  async getWallet(userId) {
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      const error = new Error('کیف پول یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1700';
      throw error;
    }
    return wallet;
  }

  async getBalance(userId) {
    const wallet = await this.getWallet(userId);
    return { balance: wallet.balance, currency: wallet.currency };
  }

  async deposit(userId, amount, description, referenceId = null, referenceType = null) {
    const transaction = await sequelize.transaction();
    try {
      const wallet = await Wallet.findOne({ where: { userId }, lock: true, transaction });
      if (!wallet) throw new Error('کیف پول یافت نشد');

      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore + parseFloat(amount);

      await wallet.update({ balance: balanceAfter }, { transaction });

      const tx = await Transaction.create({
        walletId: wallet.id,
        type: 'deposit',
        amount,
        balanceBefore,
        balanceAfter,
        description,
        referenceId,
        referenceType
      }, { transaction });

      await transaction.commit();
      return { wallet, transaction: tx };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async withdraw(userId, amount, description, referenceId = null, referenceType = null) {
    const transaction = await sequelize.transaction();
    try {
      const wallet = await Wallet.findOne({ where: { userId }, lock: true, transaction });
      if (!wallet) throw new Error('کیف پول یافت نشد');

      const balanceBefore = parseFloat(wallet.balance);
      if (balanceBefore < amount) {
        const error = new Error('موجودی کیف پول کافی نیست');
        error.statusCode = 400;
        error.errorCode = 'ERR_1702';
        throw error;
      }

      const balanceAfter = balanceBefore - parseFloat(amount);
      await wallet.update({ balance: balanceAfter }, { transaction });

      const tx = await Transaction.create({
        walletId: wallet.id,
        type: 'withdrawal',
        amount: -amount,
        balanceBefore,
        balanceAfter,
        description,
        referenceId,
        referenceType
      }, { transaction });

      await transaction.commit();
      return { wallet, transaction: tx };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async pay(userId, amount, orderId, description = 'پرداخت سفارش') {
    return this.withdraw(userId, amount, description, orderId, 'order');
  }

  async refund(userId, amount, orderId, description = 'بازگشت وجه') {
    return this.deposit(userId, amount, description, orderId, 'refund');
  }

  async getTransactions(userId, options = {}) {
    const wallet = await this.getWallet(userId);
    const { page = 1, limit = 10, type, startDate, endDate } = options;
    const where = { walletId: wallet.id };
    if (type) where.type = type;

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return { transactions: rows, total: count, page, limit };
  }
}

module.exports = new WalletService();
