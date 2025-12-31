const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      });

      this.client.on('connect', () => {
        logger.info(`Redis متصل شد: ${config.redis.host}:${config.redis.port}`);
      });

      this.client.on('error', (err) => {
        logger.error('خطای Redis', { error: err.message });
      });

      return this.client;
    } catch (error) {
      logger.error('خطا در اتصال به Redis', { error: error.message });
      return null;
    }
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('خطا در خواندن از Redis', { error: error.message, key });
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('خطا در نوشتن به Redis', { error: error.message, key });
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('خطا در حذف از Redis', { error: error.message, key });
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('خطا در حذف الگو از Redis', { error: error.message, pattern });
      return false;
    }
  }
}

module.exports = new RedisClient();
