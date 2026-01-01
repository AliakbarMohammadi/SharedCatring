const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('../utils/redis');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Create rate limiter with Redis store
 * ایجاد محدودکننده نرخ با ذخیره‌سازی Redis
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = config.rateLimit.windowMs,
    max = config.rateLimit.maxRequests,
    keyPrefix = 'rl:',
    message = null
  } = options;

  const limiterOptions = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: message || {
      success: false,
      error: {
        code: 'ERR_RATE_LIMIT',
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید',
        details: [],
        timestamp: new Date().toISOString()
      }
    },
    handler: (req, res, next, options) => {
      logger.warn('محدودیت نرخ اعمال شد', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      res.status(429).json(options.message);
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user?.userId || req.user?.id || req.ip;
    }
  };

  // Use Redis store if available
  if (redis.isReady()) {
    limiterOptions.store = new RedisStore({
      sendCommand: (...args) => redis.getClient().call(...args),
      prefix: keyPrefix
    });
  }

  return rateLimit(limiterOptions);
};

/**
 * General rate limiter
 * محدودکننده نرخ عمومی
 */
const generalLimiter = createRateLimiter({
  keyPrefix: 'rl:general:'
});

/**
 * Strict rate limiter for auth endpoints
 * محدودکننده نرخ سخت‌گیرانه برای احراز هویت
 */
const authLimiter = createRateLimiter({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.maxRequests,
  keyPrefix: 'rl:auth:',
  message: {
    success: false,
    error: {
      code: 'ERR_AUTH_RATE_LIMIT',
      message: 'تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۱۵ دقیقه صبر کنید',
      details: [],
      timestamp: new Date().toISOString()
    }
  }
});

/**
 * API rate limiter (per endpoint)
 * محدودکننده نرخ API
 */
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 6000, // 60 requests per minute
  keyPrefix: 'rl:api:'
});

/**
 * Dynamic rate limiter middleware
 * میان‌افزار محدودکننده نرخ پویا
 */
const dynamicRateLimiter = (req, res, next) => {
  // Apply stricter limits for auth endpoints
  if (req.path.startsWith('/api/v1/auth/login') || 
      req.path.startsWith('/api/v1/auth/register') ||
      req.path.startsWith('/api/v1/auth/forgot-password')) {
    return authLimiter(req, res, next);
  }

  // Apply general limiter for other endpoints
  return generalLimiter(req, res, next);
};

module.exports = {
  createRateLimiter,
  generalLimiter,
  authLimiter,
  apiLimiter,
  dynamicRateLimiter
};
