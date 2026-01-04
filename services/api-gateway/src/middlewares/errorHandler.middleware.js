const logger = require('../utils/logger');

/**
 * Safe response sender
 */
const safeResponse = (res, statusCode, body) => {
  try {
    if (res.headersSent || res.writableEnded || res.finished) {
      return false;
    }
    res.status(statusCode).json(body);
    return true;
  } catch (error) {
    logger.error('Error sending response in error handler', { error: error.message });
    return false;
  }
};

/**
 * Global error handler middleware
 * میان‌افزار مدیریت خطای سراسری
 */
const errorHandler = (err, req, res, next) => {
  // Log error with full details
  logger.error('خطای سرور', {
    requestId: req.requestId,
    error: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body ? JSON.stringify(req.body).substring(0, 200) : undefined
  });

  // Check if headers already sent
  if (res.headersSent) {
    logger.warn('Headers already sent, passing to next handler');
    return next(err);
  }

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  let errorCode = err.errorCode || err.code || 'ERR_INTERNAL';
  let message = err.message || 'خطای داخلی سرور';

  // Handle specific error types
  if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
    statusCode = 400;
    errorCode = 'ERR_INVALID_JSON';
    message = 'فرمت JSON نامعتبر است';
  } else if (err.name === 'PayloadTooLargeError') {
    statusCode = 413;
    errorCode = 'ERR_PAYLOAD_TOO_LARGE';
    message = 'حجم درخواست بیش از حد مجاز است';
  } else if (err.code === 'EBADCSRFTOKEN') {
    statusCode = 403;
    errorCode = 'ERR_CSRF';
    message = 'توکن CSRF نامعتبر است';
  }

  // Don't expose internal error messages in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'خطای داخلی سرور. لطفاً بعداً تلاش کنید';
  }

  // Send error response
  const sent = safeResponse(res, statusCode, {
    success: false,
    error: {
      code: errorCode,
      message,
      details: err.details || [],
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }
  });

  // If we couldn't send response, try to end it
  if (!sent) {
    try {
      if (!res.writableEnded) {
        res.end();
      }
    } catch (e) {
      logger.error('Failed to end response in error handler', { error: e.message });
    }
  }
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

  safeResponse(res, 404, {
    success: false,
    error: {
      code: 'ERR_NOT_FOUND',
      message: 'مسیر درخواستی یافت نشد',
      details: [{ path: req.originalUrl, method: req.method }],
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }
  });
};

/**
 * Async error wrapper - wraps async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
