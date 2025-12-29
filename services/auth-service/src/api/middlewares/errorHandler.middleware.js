const logger = require('../../utils/logger');

/**
 * Global error handler middleware
 * میان‌افزار مدیریت خطای سراسری
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('خطای سرور', {
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
  const errorCode = err.code || 'ERR_INTERNAL';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'اطلاعات وارد شده نامعتبر است',
        details,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'ERR_DUPLICATE',
        message: `این ${field === 'email' ? 'ایمیل' : field} قبلاً ثبت شده است`,
        details: [{ field, value: err.keyValue[field] }],
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_INVALID_TOKEN',
        message: 'توکن نامعتبر است',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_TOKEN_EXPIRED',
        message: 'توکن منقضی شده است',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

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
