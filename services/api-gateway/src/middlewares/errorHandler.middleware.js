const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * میان‌افزار مدیریت خطای سراسری
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('خطای سرور', {
    requestId: req.requestId,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Check if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.errorCode || err.code || 'ERR_INTERNAL';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: statusCode === 500 
        ? 'خطای داخلی سرور. لطفاً بعداً تلاش کنید' 
        : err.message,
      details: err.details || [],
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Not found handler
 * مدیریت مسیرهای یافت نشده
 */
const notFoundHandler = (req, res) => {
  logger.warn('مسیر یافت نشد', {
    requestId: req.requestId,
    path: req.path,
    method: req.method
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_NOT_FOUND',
      message: 'مسیر درخواستی یافت نشد',
      details: [{ path: req.originalUrl, method: req.method }],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
