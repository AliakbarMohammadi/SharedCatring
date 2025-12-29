const logger = require('../utils/logger');

/**
 * Request/Response Logger Middleware
 * میان‌افزار لاگ درخواست و پاسخ
 */
const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  logger.info('درخواست دریافت شد', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId || req.user?.id || null
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;

    // Determine log level based on status code
    const logLevel = res.statusCode >= 500 ? 'error' 
                   : res.statusCode >= 400 ? 'warn' 
                   : 'info';

    logger[logLevel]('پاسخ ارسال شد', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || req.user?.id || null
    });

    return originalSend.call(this, body);
  };

  next();
};

module.exports = requestLoggerMiddleware;
