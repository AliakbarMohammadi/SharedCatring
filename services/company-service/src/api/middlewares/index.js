const rateLimit = require('express-rate-limit');
const config = require('../../config');
const logger = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) logger.error('خطای سرور', { error: err.message, stack: err.stack, path: req.path });
  res.status(statusCode).json({
    success: false,
    error: { code: err.code || 'ERR_INTERNAL', message: err.message || 'خطای داخلی سرور', details: err.details || [] }
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, error: { code: 'ERR_NOT_FOUND', message: 'مسیر یافت نشد', details: [] } });
};

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { success: false, error: { code: 'ERR_RATE_LIMIT', message: 'تعداد درخواست‌ها بیش از حد مجاز است' } }
});

const extractUser = (req, res, next) => {
  req.userId = req.headers['x-user-id'];
  req.userRole = req.headers['x-user-role'];
  next();
};

module.exports = { errorHandler, notFoundHandler, generalLimiter, extractUser };
