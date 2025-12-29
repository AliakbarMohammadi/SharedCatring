const { v4: uuidv4 } = require('uuid');

/**
 * Request ID Middleware
 * میان‌افزار شناسه درخواست
 * 
 * Generates unique request ID for tracing
 */
const requestIdMiddleware = (req, res, next) => {
  // Use existing request ID or generate new one
  const requestId = req.headers['x-request-id'] || 
                    req.headers['x-correlation-id'] || 
                    uuidv4();

  // Attach to request
  req.requestId = requestId;

  // Set response header
  res.setHeader('X-Request-ID', requestId);

  next();
};

module.exports = requestIdMiddleware;
