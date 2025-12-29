const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const Redis = require('ioredis');
const config = require('../../config');

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
});

const rateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }),
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'ERR_1007',
      message: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید',
      details: []
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for auth endpoints
const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: {
      code: 'ERR_1007',
      message: 'تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۱۵ دقیقه صبر کنید',
      details: []
    }
  }
});

module.exports = {
  rateLimiter,
  authRateLimiter,
  redisClient
};
