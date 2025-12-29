/**
 * Request logger middleware
 * Logs incoming requests and outgoing responses
 */
const requestLogger = (logger) => {
  return (req, res, next) => {
    const startTime = Date.now();

    // Generate request ID if not present
    req.requestId = req.headers['x-request-id'] || req.headers['x-correlation-id'] || generateRequestId();
    res.setHeader('X-Request-ID', req.requestId);

    // Log incoming request
    logger.info('درخواست دریافت شد', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || null
    });

    // Capture response
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - startTime;

      // Log response
      logger.info('پاسخ ارسال شد', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id || null
      });

      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = requestLogger;
