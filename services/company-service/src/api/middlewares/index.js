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

/**
 * Require Super Admin role
 * فقط مدیر کل دسترسی دارد
 */
const requireSuperAdmin = (req, res, next) => {
  const userRole = req.headers['x-user-role'];
  
  if (userRole !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ERR_FORBIDDEN',
        message: 'فقط مدیر کل به این بخش دسترسی دارد',
        details: []
      }
    });
  }
  
  next();
};

/**
 * Require authentication
 * نیاز به احراز هویت
 */
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (!userId || !userRole) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_UNAUTHORIZED',
        message: 'برای دسترسی به این بخش باید وارد شوید',
        details: []
      }
    });
  }
  
  req.userId = userId;
  req.userRole = userRole;
  next();
};

module.exports = { errorHandler, notFoundHandler, generalLimiter, extractUser, requireSuperAdmin, requireAuth };
