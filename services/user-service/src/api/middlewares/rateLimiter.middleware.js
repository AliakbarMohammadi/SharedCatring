const rateLimit = require('express-rate-limit');
const config = require('../../config');

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'ERR_RATE_LIMIT', message: 'تعداد درخواست‌های شما بیش از حد مجاز است', details: [], timestamp: new Date().toISOString() }
  }
});

module.exports = { generalLimiter };
