const { authMiddleware, optionalAuth, authorize } = require('./auth.middleware');
const { dynamicRateLimiter, generalLimiter, authLimiter, apiLimiter } = require('./rateLimiter.middleware');
const { setupProxyRoutes, dynamicProxy } = require('./proxy.middleware');
const requestIdMiddleware = require('./requestId.middleware');
const requestLoggerMiddleware = require('./requestLogger.middleware');
const { errorHandler, notFoundHandler } = require('./errorHandler.middleware');

module.exports = {
  // Auth
  authMiddleware,
  optionalAuth,
  authorize,

  // Rate Limiting
  dynamicRateLimiter,
  generalLimiter,
  authLimiter,
  apiLimiter,

  // Proxy
  setupProxyRoutes,
  dynamicProxy,

  // Request
  requestIdMiddleware,
  requestLoggerMiddleware,

  // Error Handling
  errorHandler,
  notFoundHandler
};
