const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

/**
 * Wallet Service Client
 * کلاینت برای ارتباط با سرویس کیف پول
 */
class WalletClient {
  constructor() {
    this.baseUrl = config.services?.wallet || 'http://localhost:3009';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': config.internalApiKey || 'internal-key'
      }
    });

    logger.info('Wallet Client initialized', { baseUrl: this.baseUrl });
  }

  /**
   * Check user balance
   * @param {string} userId 
   * @param {number} amount 
   * @param {string} balanceType - 'personal' or 'company'
   */
  async checkBalance(userId, amount, balanceType = 'personal') {
    try {
      const response = await this.client.post('/internal/check-balance', {
        userId,
        amount,
        balanceType
      });

      if (response.data.success) {
        return response.data.data;
      }

      return { sufficient: false, currentBalance: 0 };
    } catch (error) {
      logger.error('خطا در بررسی موجودی کیف پول', {
        userId,
        error: error.message
      });
      throw {
        statusCode: 503,
        code: 'ERR_WALLET_SERVICE_UNAVAILABLE',
        message: 'سرویس کیف پول در دسترس نیست'
      };
    }
  }

  /**
   * Deduct from wallet
   * @param {string} userId 
   * @param {number} amount 
   * @param {string} balanceType 
   * @param {string} referenceType 
   * @param {string} referenceId 
   * @param {string} description 
   */
  async deduct(userId, amount, balanceType, referenceType, referenceId, description) {
    try {
      const response = await this.client.post('/internal/deduct', {
        userId,
        amount,
        balanceType,
        referenceType,
        referenceId,
        description
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw {
        statusCode: 400,
        code: response.data.error?.code || 'ERR_DEDUCT_FAILED',
        message: response.data.error?.message || 'خطا در کسر از کیف پول'
      };
    } catch (error) {
      if (error.statusCode) throw error;

      if (error.response?.data?.error) {
        throw {
          statusCode: error.response.status || 400,
          code: error.response.data.error.code,
          message: error.response.data.error.message
        };
      }

      logger.error('خطا در کسر از کیف پول', {
        userId,
        amount,
        error: error.message
      });

      throw {
        statusCode: 503,
        code: 'ERR_WALLET_SERVICE_UNAVAILABLE',
        message: 'سرویس کیف پول در دسترس نیست'
      };
    }
  }

  /**
   * Refund to wallet
   */
  async refund(userId, amount, balanceType, referenceType, referenceId, description) {
    try {
      const response = await this.client.post('/internal/refund', {
        userId,
        amount,
        balanceType,
        referenceType,
        referenceId,
        description
      });

      return response.data.success ? response.data.data : null;
    } catch (error) {
      logger.error('خطا در برگشت به کیف پول', {
        userId,
        amount,
        error: error.message
      });
      return null;
    }
  }
}

module.exports = new WalletClient();
