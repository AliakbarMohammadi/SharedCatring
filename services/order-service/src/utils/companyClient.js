const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

/**
 * Company Service Client
 * کلاینت برای ارتباط با سرویس شرکت‌ها
 */
class CompanyClient {
  constructor() {
    this.baseUrl = config.services.company;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info('Company Client initialized', { baseUrl: this.baseUrl });
  }

  /**
   * Calculate subsidy for an order
   * @param {string} companyId 
   * @param {string} userId 
   * @param {number} orderAmount 
   * @param {string} mealType 
   */
  async calculateSubsidy(companyId, userId, orderAmount, mealType = 'lunch') {
    const url = `/api/v1/companies/${companyId}/subsidy/calculate`;

    logger.debug('درخواست محاسبه یارانه', {
      companyId,
      userId,
      orderAmount,
      mealType
    });

    try {
      const response = await this.client.post(url, {
        userId,
        orderAmount,
        mealType
      });

      if (response.data.success) {
        logger.info('یارانه محاسبه شد', response.data.data);
        return response.data.data;
      }

      return { subsidyAmount: 0, reason: 'خطا در محاسبه یارانه' };
    } catch (error) {
      logger.error('خطا در ارتباط با Company Service', {
        companyId,
        error: error.message,
        status: error.response?.status
      });

      // Return zero subsidy on error (graceful degradation)
      return { 
        subsidyAmount: 0, 
        reason: 'سرویس شرکت در دسترس نیست',
        error: error.message
      };
    }
  }

  /**
   * Get employee info for ordering
   * @param {string} companyId 
   * @param {string} userId 
   */
  async getEmployeeInfo(companyId, userId) {
    const url = `/api/v1/companies/${companyId}/employee-info?userId=${userId}`;

    try {
      const response = await this.client.get(url);

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      logger.warn('خطا در دریافت اطلاعات کارمند', {
        companyId,
        userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health', { timeout: 3000 });
      return response.data?.success === true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new CompanyClient();
