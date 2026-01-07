const { Wallet, WalletTransaction, CompanyWalletPool } = require('../models');
const eventPublisher = require('../events/publisher');
const config = require('../config');
const { transactionTypeLabels, balanceTypeLabels } = require('../utils/helpers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class WalletService {
  // Get or create wallet for user
  async getOrCreateWallet(userId, companyId = null) {
    let wallet = await Wallet.findOne({ where: { userId } });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        companyId,
        personalBalance: 0,
        companyBalance: 0
      });
      logger.info('کیف پول ایجاد شد', { userId, walletId: wallet.id });
    }
    
    return wallet;
  }

  // Get wallet balance
  async getBalance(userId) {
    const wallet = await this.getOrCreateWallet(userId);
    return this.formatWallet(wallet);
  }

  // Get transactions history
  async getTransactions(userId, options = {}) {
    const { page = 1, limit = 20, type, balanceType, fromDate, toDate } = options;
    const offset = (page - 1) * limit;

    const wallet = await this.getOrCreateWallet(userId);

    const where = { walletId: wallet.id };
    if (type) where.type = type;
    if (balanceType) where.balanceType = balanceType;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const { count, rows } = await WalletTransaction.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      transactions: rows.map(t => this.formatTransaction(t)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Topup personal wallet
  async topupPersonal(userId, amount, referenceId = null, description = null) {
    if (amount < config.wallet.minTopupAmount) {
      throw {
        statusCode: 400,
        code: 'ERR_MIN_AMOUNT',
        message: `حداقل مبلغ شارژ ${config.wallet.minTopupAmount.toLocaleString('fa-IR')} تومان است`
      };
    }

    if (amount > config.wallet.maxTopupAmount) {
      throw {
        statusCode: 400,
        code: 'ERR_MAX_AMOUNT',
        message: `حداکثر مبلغ شارژ ${config.wallet.maxTopupAmount.toLocaleString('fa-IR')} تومان است`
      };
    }

    const transaction = await sequelize.transaction();
    
    try {
      const wallet = await this.getOrCreateWallet(userId);
      const balanceBefore = parseFloat(wallet.personalBalance);
      const balanceAfter = balanceBefore + amount;

      await wallet.update({ personalBalance: balanceAfter }, { transaction });

      const walletTx = await WalletTransaction.create({
        walletId: wallet.id,
        type: 'topup_personal',
        balanceType: 'personal',
        amount,
        balanceBefore,
        balanceAfter,
        referenceType: 'payment',
        referenceId,
        description: description || 'شارژ کیف پول شخصی'
      }, { transaction });

      await transaction.commit();

      await eventPublisher.publish('wallet.charged', {
        walletId: wallet.id,
        userId,
        amount,
        balanceType: 'personal',
        newBalance: balanceAfter
      });

      logger.info('کیف پول شارژ شد', { userId, amount, balanceAfter });

      return {
        wallet: this.formatWallet(wallet),
        transaction: this.formatTransaction(walletTx)
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Deduct from wallet (internal API)
  async deduct(userId, amount, balanceType, referenceType, referenceId, description) {
    const transaction = await sequelize.transaction();
    
    try {
      const wallet = await this.getOrCreateWallet(userId);
      const balanceField = balanceType === 'company' ? 'companyBalance' : 'personalBalance';
      const currentBalance = parseFloat(wallet[balanceField]);

      if (currentBalance < amount) {
        throw {
          statusCode: 400,
          code: 'ERR_INSUFFICIENT_BALANCE',
          message: 'موجودی کیف پول کافی نیست'
        };
      }

      const balanceAfter = currentBalance - amount;
      await wallet.update({ [balanceField]: balanceAfter }, { transaction });

      const walletTx = await WalletTransaction.create({
        walletId: wallet.id,
        type: 'order_payment',
        balanceType,
        amount: -amount,
        balanceBefore: currentBalance,
        balanceAfter,
        referenceType,
        referenceId,
        description: description || 'پرداخت سفارش'
      }, { transaction });

      await transaction.commit();

      await eventPublisher.publish('wallet.debited', {
        walletId: wallet.id,
        userId,
        amount,
        balanceType,
        newBalance: balanceAfter
      });

      // Check low balance
      if (balanceAfter < config.wallet.lowBalanceThreshold) {
        await eventPublisher.publish('wallet.low_balance', {
          walletId: wallet.id,
          userId,
          balance: balanceAfter,
          balanceType
        });
      }

      logger.info('از کیف پول کسر شد', { userId, amount, balanceType, balanceAfter });

      return {
        success: true,
        wallet: this.formatWallet(wallet),
        transaction: this.formatTransaction(walletTx)
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Refund to wallet (internal API)
  async refund(userId, amount, balanceType, referenceType, referenceId, description) {
    const transaction = await sequelize.transaction();
    
    try {
      const wallet = await this.getOrCreateWallet(userId);
      const balanceField = balanceType === 'company' ? 'companyBalance' : 'personalBalance';
      const currentBalance = parseFloat(wallet[balanceField]);
      const balanceAfter = currentBalance + amount;

      await wallet.update({ [balanceField]: balanceAfter }, { transaction });

      const walletTx = await WalletTransaction.create({
        walletId: wallet.id,
        type: 'order_refund',
        balanceType,
        amount,
        balanceBefore: currentBalance,
        balanceAfter,
        referenceType,
        referenceId,
        description: description || 'استرداد سفارش'
      }, { transaction });

      await transaction.commit();

      await eventPublisher.publish('wallet.charged', {
        walletId: wallet.id,
        userId,
        amount,
        balanceType,
        newBalance: balanceAfter,
        isRefund: true
      });

      logger.info('به کیف پول برگشت داده شد', { userId, amount, balanceType, balanceAfter });

      return {
        success: true,
        wallet: this.formatWallet(wallet),
        transaction: this.formatTransaction(walletTx)
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Check balance (internal API)
  async checkBalance(userId, amount, balanceType = 'personal') {
    const wallet = await this.getOrCreateWallet(userId);
    const balanceField = balanceType === 'company' ? 'companyBalance' : 'personalBalance';
    const currentBalance = parseFloat(wallet[balanceField]);

    return {
      sufficient: currentBalance >= amount,
      currentBalance,
      requiredAmount: amount,
      shortfall: Math.max(0, amount - currentBalance)
    };
  }

  // Company wallet methods
  async getCompanyPool(companyId) {
    let pool = await CompanyWalletPool.findOne({ where: { companyId } });
    
    if (!pool) {
      pool = await CompanyWalletPool.create({
        companyId,
        totalBalance: 0,
        allocatedBalance: 0,
        availableBalance: 0
      });
    }
    
    return this.formatCompanyPool(pool);
  }

  async topupCompanyPool(companyId, amount, description = null) {
    const transaction = await sequelize.transaction();
    
    try {
      let pool = await CompanyWalletPool.findOne({ where: { companyId } });
      
      if (!pool) {
        pool = await CompanyWalletPool.create({ companyId }, { transaction });
      }

      const newTotal = parseFloat(pool.totalBalance) + amount;
      const newAvailable = parseFloat(pool.availableBalance) + amount;

      await pool.update({
        totalBalance: newTotal,
        availableBalance: newAvailable
      }, { transaction });

      await transaction.commit();

      logger.info('حساب شرکت شارژ شد', { companyId, amount, newTotal });

      return this.formatCompanyPool(pool);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async allocateSubsidy(companyId, employeeUserId, amount, description = null) {
    const transaction = await sequelize.transaction();
    
    try {
      const pool = await CompanyWalletPool.findOne({ where: { companyId } });
      
      if (!pool) {
        throw {
          statusCode: 404,
          code: 'ERR_COMPANY_POOL_NOT_FOUND',
          message: 'حساب شرکت یافت نشد'
        };
      }

      if (parseFloat(pool.availableBalance) < amount) {
        throw {
          statusCode: 400,
          code: 'ERR_INSUFFICIENT_COMPANY_BALANCE',
          message: 'موجودی حساب شرکت کافی نیست'
        };
      }

      // Deduct from company pool
      await pool.update({
        availableBalance: parseFloat(pool.availableBalance) - amount,
        allocatedBalance: parseFloat(pool.allocatedBalance) + amount
      }, { transaction });

      // Add to employee wallet
      const wallet = await this.getOrCreateWallet(employeeUserId, companyId);
      const balanceBefore = parseFloat(wallet.companyBalance);
      const balanceAfter = balanceBefore + amount;

      await wallet.update({ 
        companyBalance: balanceAfter,
        companyId 
      }, { transaction });

      await WalletTransaction.create({
        walletId: wallet.id,
        type: 'subsidy_allocation',
        balanceType: 'company',
        amount,
        balanceBefore,
        balanceAfter,
        referenceType: 'company',
        referenceId: companyId,
        description: description || 'تخصیص یارانه سازمانی'
      }, { transaction });

      await transaction.commit();

      logger.info('یارانه تخصیص داده شد', { companyId, employeeUserId, amount });

      return {
        pool: this.formatCompanyPool(pool),
        employeeWallet: this.formatWallet(wallet)
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getCompanyEmployees(companyId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await Wallet.findAndCountAll({
      where: { companyId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      employees: rows.map(w => this.formatWallet(w)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Check company pool balance
   * بررسی موجودی حساب شرکت
   */
  async checkCompanyPoolBalance(companyId, amount) {
    const pool = await CompanyWalletPool.findOne({ where: { companyId } });
    
    if (!pool) {
      return {
        sufficient: false,
        currentBalance: 0,
        requiredAmount: amount,
        shortfall: amount,
        error: 'حساب شرکت یافت نشد'
      };
    }

    const availableBalance = parseFloat(pool.availableBalance);
    return {
      sufficient: availableBalance >= amount,
      currentBalance: availableBalance,
      requiredAmount: amount,
      shortfall: Math.max(0, amount - availableBalance)
    };
  }

  /**
   * Deduct subsidy from company pool for order
   * کسر یارانه از حساب شرکت برای سفارش
   */
  async deductCompanySubsidy(companyId, employeeUserId, amount, orderId, description = null) {
    const transaction = await sequelize.transaction();
    
    try {
      const pool = await CompanyWalletPool.findOne({ where: { companyId } });
      
      if (!pool) {
        throw {
          statusCode: 404,
          code: 'ERR_COMPANY_POOL_NOT_FOUND',
          message: 'حساب شرکت یافت نشد'
        };
      }

      const availableBalance = parseFloat(pool.availableBalance);
      if (availableBalance < amount) {
        throw {
          statusCode: 400,
          code: 'ERR_INSUFFICIENT_COMPANY_BALANCE',
          message: 'موجودی حساب شرکت برای پرداخت یارانه کافی نیست'
        };
      }

      // Deduct from company pool
      const newAvailable = availableBalance - amount;
      await pool.update({
        availableBalance: newAvailable,
        totalBalance: parseFloat(pool.totalBalance) - amount
      }, { transaction });

      // Record transaction in company pool (we could create a separate table for this)
      // For now, we'll use the employee's wallet transaction as reference

      await transaction.commit();

      await eventPublisher.publish('company.subsidy.deducted', {
        companyId,
        employeeUserId,
        amount,
        orderId,
        newBalance: newAvailable
      });

      logger.info('یارانه از حساب شرکت کسر شد', { 
        companyId, 
        employeeUserId, 
        amount, 
        orderId,
        newBalance: newAvailable 
      });

      return {
        success: true,
        deductedAmount: amount,
        newBalance: newAvailable,
        pool: this.formatCompanyPool(pool)
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  formatWallet(wallet) {
    return {
      id: wallet.id,
      userId: wallet.userId,
      personalBalance: parseFloat(wallet.personalBalance),
      companyBalance: parseFloat(wallet.companyBalance),
      totalBalance: parseFloat(wallet.personalBalance) + parseFloat(wallet.companyBalance),
      companyId: wallet.companyId,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    };
  }

  formatTransaction(tx) {
    return {
      id: tx.id,
      type: tx.type,
      typeLabel: transactionTypeLabels[tx.type],
      balanceType: tx.balanceType,
      balanceTypeLabel: balanceTypeLabels[tx.balanceType],
      amount: parseFloat(tx.amount),
      balanceBefore: parseFloat(tx.balanceBefore),
      balanceAfter: parseFloat(tx.balanceAfter),
      referenceType: tx.referenceType,
      referenceId: tx.referenceId,
      description: tx.description,
      createdAt: tx.createdAt
    };
  }

  formatCompanyPool(pool) {
    return {
      id: pool.id,
      companyId: pool.companyId,
      totalBalance: parseFloat(pool.totalBalance),
      allocatedBalance: parseFloat(pool.allocatedBalance),
      availableBalance: parseFloat(pool.availableBalance),
      monthlyBudget: parseFloat(pool.monthlyBudget),
      subsidyPerEmployee: parseFloat(pool.subsidyPerEmployee),
      isActive: pool.isActive,
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt
    };
  }
}

module.exports = new WalletService();
