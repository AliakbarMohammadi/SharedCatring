const rateLimit = require('express-rate-limit');
const config = require('../../config');
const logger = require('../../utils/logger');

/**
 * Login rate limiter
 * محدودکننده نرخ ورود
 * Maximum 5 attempts per minute per IP
 */
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 1 minute
  max: config.rateLimit.maxRequests, // 5 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'ERR_RATE_LIMIT',
      message: 'تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً یک دقیقه صبر کنید',
      details: [],
      timestamp: new Date().toISOString()
    }
  },
  handler: (req, res, next, options) => {
    logger.warn('محدودیت نرخ ورود اعمال شد', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => req.ip
});

/**
 * General rate limiter
 * محدودکننده نرخ عمومی
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'ERR_RATE_LIMIT',
      message: 'تعداد درخواست‌های شما بیش از حد مجاز است',
      details: [],
      timestamp: new Date().toISOString()
    }
  }
});

/**
 * Password reset rate limiter
 * محدودکننده نرخ بازیابی رمز عبور
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'ERR_RATE_LIMIT',
      message: 'تعداد درخواست‌های بازیابی رمز عبور بیش از حد مجاز است. لطفاً ۱۵ دقیقه صبر کنید',
      details: [],
      timestamp: new Date().toISOString()
    }
  }
});

module.exports = {
  loginLimiter,
  generalLimiter,
  passwordResetLimiter
};
