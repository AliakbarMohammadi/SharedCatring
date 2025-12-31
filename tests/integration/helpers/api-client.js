/**
 * API Client Helper
 * کلاینت API برای تست‌ها
 */

const axios = require('axios');
const config = require('../config');

class ApiClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: config.timeouts.medium,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'fa-IR'
      }
    });

    this.token = null;
  }

  setToken(token) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  setUserHeaders(userId, role = 'user', companyId = null) {
    this.client.defaults.headers.common['X-User-ID'] = userId;
    this.client.defaults.headers.common['X-User-Role'] = role;
    if (companyId) {
      this.client.defaults.headers.common['X-Company-ID'] = companyId;
    }
  }

  clearAuth() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    delete this.client.defaults.headers.common['X-User-ID'];
    delete this.client.defaults.headers.common['X-User-Role'];
    delete this.client.defaults.headers.common['X-Company-ID'];
  }

  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch(url, data = {}, config = {}) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        error: error.response.data?.error || {
          code: 'ERR_UNKNOWN',
          message: error.message
        }
      };
    }
    return {
      success: false,
      status: 0,
      error: {
        code: 'ERR_NETWORK',
        message: error.message
      }
    };
  }
}

// Create clients for each service
const clients = {
  gateway: new ApiClient(config.services.apiGateway),
  auth: new ApiClient(config.services.auth),
  identity: new ApiClient(config.services.identity),
  user: new ApiClient(config.services.user),
  company: new ApiClient(config.services.company),
  menu: new ApiClient(config.services.menu),
  order: new ApiClient(config.services.order),
  invoice: new ApiClient(config.services.invoice),
  payment: new ApiClient(config.services.payment),
  wallet: new ApiClient(config.services.wallet),
  notification: new ApiClient(config.services.notification),
  reporting: new ApiClient(config.services.reporting),
  file: new ApiClient(config.services.file)
};

module.exports = { ApiClient, clients };
