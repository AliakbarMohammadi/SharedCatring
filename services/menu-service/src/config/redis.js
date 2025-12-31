const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

redis.on('connect', () => {
  logger.info('اتصال به Redis برقرار شد');
});

redis.on('error', (err) => {
  logger.error('خطای Redis', { error: err.message });
});

module.exports = redis;
