const axios = require('axios');
const CircuitBreaker = require('./CircuitBreaker');

/**
 * HTTP Service Client with retry logic and circuit breaker
 */
class ServiceClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.options = {
      timeout: options.timeout || 10000,
      retries: options.retries || 3,
      retryDelay: options.retryDelay || 1000,
      retryCondition: options.retryCondition || this.defaultRetryCondition,
      ...options
    };

    // Create axios instance
    this.client = axios.create({
      baseURL,
      timeout: this.options.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Circuit breaker
    if (options.circuitBreaker?.enabled !== false) {
      this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
    }

    // Setup interceptors
    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add correlation ID
        if (!config.headers['X-Correlation-ID']) {
          config.headers['X-Correlation-ID'] = this.generateCorrelationId();
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.circuitBreaker) {
          this.circuitBreaker.onSuccess();
        }
        return response.data;
      },
      (error) => {
        if (this.circuitBreaker) {
          this.circuitBreaker.onFailure();
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Transform axios error to standard format
   */
  transformError(error) {
    if (error.response) {
      // Server responded with error
      const err = new Error(error.response.data?.error?.message || 'خطا در ارتباط با سرویس');
      err.statusCode = error.response.status;
      err.errorCode = error.response.data?.error?.code || 'ERR_SERVICE';
      err.details = error.response.data?.error?.details || [];
      err.service = this.baseURL;
      return err;
    }

    if (error.code === 'ECONNREFUSED') {
      const err = new Error('سرویس در دسترس نیست');
      err.statusCode = 503;
      err.errorCode = 'ERR_SERVICE_UNAVAILABLE';
      err.service = this.baseURL;
      return err;
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      const err = new Error('زمان پاسخ‌دهی سرویس به پایان رسید');
      err.statusCode = 504;
      err.errorCode = 'ERR_TIMEOUT';
      err.service = this.baseURL;
      return err;
    }

    return error;
  }

  /**
   * Default retry condition
   */
  defaultRetryCondition(error) {
    // Retry on network errors or 5xx responses
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  /**
   * Execute request with retry logic
   */
  async executeWithRetry(requestFn, retries = this.options.retries) {
    // Check circuit breaker
    if (this.circuitBreaker && !this.circuitBreaker.canRequest()) {
      const err = new Error('سرویس موقتاً در دسترس نیست');
      err.statusCode = 503;
      err.errorCode = 'ERR_CIRCUIT_OPEN';
      err.service = this.baseURL;
      throw err;
    }

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Check if should retry
        if (attempt < retries && this.options.retryCondition(error)) {
          console.log(`تلاش مجدد ${attempt + 1}/${retries} برای ${this.baseURL}`);
          await this.delay(this.options.retryDelay * (attempt + 1));
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate correlation ID
   */
  generateCorrelationId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set auth token
   */
  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set correlation ID
   */
  setCorrelationId(correlationId) {
    this.client.defaults.headers.common['X-Correlation-ID'] = correlationId;
  }

  /**
   * Get circuit breaker state
   */
  getCircuitState() {
    return this.circuitBreaker?.getState() || 'DISABLED';
  }

  // HTTP Methods

  async get(url, config = {}) {
    return this.executeWithRetry(() => this.client.get(url, config));
  }

  async post(url, data, config = {}) {
    return this.executeWithRetry(() => this.client.post(url, data, config));
  }

  async put(url, data, config = {}) {
    return this.executeWithRetry(() => this.client.put(url, data, config));
  }

  async patch(url, data, config = {}) {
    return this.executeWithRetry(() => this.client.patch(url, data, config));
  }

  async delete(url, config = {}) {
    return this.executeWithRetry(() => this.client.delete(url, config));
  }
}

module.exports = ServiceClient;
