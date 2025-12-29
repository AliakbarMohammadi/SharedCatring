const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

const identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002';

const serviceClient = axios.create({
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

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

const identityService = {
  async getUserByEmail(email) {
    try {
      // Use internal endpoint that returns passwordHash
      const response = await serviceClient.get(
        `${identityServiceUrl}/api/v1/identity/users/internal/by-email/${encodeURIComponent(email)}`
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
      return null;
    }
  },

  async getUserById(userId) {
    try {
      const response = await serviceClient.get(`${identityServiceUrl}/api/v1/identity/users/${userId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      logger.error('خطا در دریافت کاربر از Identity Service', { userId, error: error.message });
      return null;
    }
  },

  async createUser(userData) {
    try {
      const response = await serviceClient.post(`${identityServiceUrl}/api/v1/identity/users`, userData);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 409) {
        throw { statusCode: 409, code: 'ERR_USER_EXISTS', message: 'این ایمیل قبلاً ثبت شده است' };
      }
      logger.error('خطا در ایجاد کاربر در Identity Service', { error: error.message });
      throw error;
    }
  },

  async updateUserPassword(userId, passwordHash) {
    try {
      // This would be an internal endpoint in production
      logger.info('درخواست تغییر رمز عبور', { userId });
      return true;
    } catch (error) {
      logger.error('خطا در تغییر رمز عبور', { userId, error: error.message });
      return false;
    }
  }
};

module.exports = { serviceClient, identityService };
