const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

const identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002';

const serviceClient = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor for logging
serviceClient.interceptors.request.use(
  request => {
    logger.debug('درخواست به سرویس', {
      url: request.url,
      method: request.method
    });
    return request;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
serviceClient.interceptors.response.use(
  response => response,
  error => {
    logger.error('خطا در ارتباط با سرویس', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

/**
 * Identity Service Client
 * کلاینت سرویس هویت - ارتباط واقعی با دیتابیس
 */
const identityService = {
  /**
   * Get user by email with password hash for authentication
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  async getUserByEmail(email) {
    try {
      const response = await serviceClient.get(
        `${identityServiceUrl}/api/v1/identity/users/by-email/${encodeURIComponent(email)}`
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('خطا در دریافت کاربر از Identity Service', { email, error: error.message });
      throw {
        statusCode: 503,
        code: 'ERR_SERVICE_UNAVAILABLE',
        message: 'سرویس هویت در دسترس نیست. لطفاً دوباره تلاش کنید'
      };
    }
  },

  /**
   * Get user by ID
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  async getUserById(userId) {
    try {
      const response = await serviceClient.get(`${identityServiceUrl}/api/v1/identity/users/${userId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('خطا در دریافت کاربر از Identity Service', { userId, error: error.message });
      throw {
        statusCode: 503,
        code: 'ERR_SERVICE_UNAVAILABLE',
        message: 'سرویس هویت در دسترس نیست. لطفاً دوباره تلاش کنید'
      };
    }
  },

  /**
   * Create new user in Identity Service
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    try {
      const response = await serviceClient.post(`${identityServiceUrl}/api/v1/identity/users`, userData);
      if (response.data.success) {
        logger.info('کاربر در Identity Service ایجاد شد', { userId: response.data.data.id });
        return response.data.data;
      }
      throw new Error('خطا در ایجاد کاربر');
    } catch (error) {
      if (error.response?.status === 409) {
        const errorData = error.response.data?.error || {};
        throw { 
          statusCode: 409, 
          code: errorData.code || 'ERR_USER_EXISTS', 
          message: errorData.message || 'این ایمیل یا شماره موبایل قبلاً ثبت شده است' 
        };
      }
      logger.error('خطا در ایجاد کاربر در Identity Service', { error: error.message });
      throw {
        statusCode: error.statusCode || 503,
        code: error.code || 'ERR_SERVICE_UNAVAILABLE',
        message: error.message || 'سرویس هویت در دسترس نیست. لطفاً دوباره تلاش کنید'
      };
    }
  },

  /**
   * Update user password in Identity Service
   * @param {string} userId 
   * @param {string} passwordHash 
   * @returns {Promise<boolean>}
   */
  async updateUserPassword(userId, passwordHash) {
    try {
      const response = await serviceClient.patch(
        `${identityServiceUrl}/api/v1/identity/users/${userId}/password`,
        { passwordHash }
      );
      
      if (response.data.success) {
        logger.info('رمز عبور در Identity Service تغییر کرد', { userId });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('خطا در تغییر رمز عبور در Identity Service', { userId, error: error.message });
      throw {
        statusCode: 503,
        code: 'ERR_SERVICE_UNAVAILABLE',
        message: 'خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید'
      };
    }
  },

  /**
   * Update user status in Identity Service
   * @param {string} userId 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async updateUserStatus(userId, status) {
    try {
      const response = await serviceClient.patch(
        `${identityServiceUrl}/api/v1/identity/users/${userId}/status`,
        { status }
      );
      
      if (response.data.success) {
        logger.info('وضعیت کاربر در Identity Service تغییر کرد', { userId, status });
        return response.data.data;
      }
      return null;
    } catch (error) {
      logger.error('خطا در تغییر وضعیت کاربر', { userId, error: error.message });
      throw {
        statusCode: 503,
        code: 'ERR_SERVICE_UNAVAILABLE',
        message: 'خطا در تغییر وضعیت کاربر. لطفاً دوباره تلاش کنید'
      };
    }
  }
};

module.exports = { serviceClient, identityService };
