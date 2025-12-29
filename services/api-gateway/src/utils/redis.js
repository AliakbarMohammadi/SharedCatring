const Redis = require('ioredis');
const config = require('../config');
const logger = require('./logger');

/**
 * Redis client singleton
 * کلاینت Redis
 */
class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Get Redis client instance
   * @returns {Redis}
   */
  getClient() {
    if (!this.client) {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db,
        retryStrategy: (times) => {
          if (times > 10) {
            logger.error('تلاش‌های اتصال به Redis به پایان رسید');
            return null;
          }
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
        maxRetriesPerRequest: 3
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('اتصال به Redis برقرار شد');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        logger.error('خطای Redis:', { error: err.message });
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('اتصال Redis بسته شد');
      });
    }

    return this.client;
  }

  /**
   * Check if Redis is connected
   * @returns {boolean}
   */
  isReady() {
    return this.isConnected && this.client?.status === 'ready';
  }

  /**
   * Get value from cache
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  async get(key) {
    try {
      return await this.getClient().get(key);
    } catch (error) {
      logger.error('خطا در دریافت از Redis:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key
   * @param {string} value
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttl = null) {
    try {
      if (ttl) {
        await this.getClient().setex(key, ttl, value);
      } else {
        await this.getClient().set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('خطا در ذخیره در Redis:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    try {
      await this.getClient().del(key);
      return true;
    } catch (error) {
      logger.error('خطا در حذف از Redis:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      const result = await this.getClient().exists(key);
      return result === 1;
    } catch (error) {
      logger.error('خطا در بررسی وجود کلید Redis:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Increment value
   * @param {string} key
   * @returns {Promise<number>}
   */
  async incr(key) {
    try {
      return await this.getClient().incr(key);
    } catch (error) {
      logger.error('خطا در افزایش مقدار Redis:', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Set expiry on key
   * @param {string} key
   * @param {number} seconds
   * @returns {Promise<boolean>}
   */
  async expire(key, seconds) {
    try {
      await this.getClient().expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('خطا در تنظیم انقضا Redis:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info('اتصال Redis بسته شد');
    }
  }
}

// Export singleton instance
module.exports = new RedisClient();
