const { authenticate, optionalAuth } = require('./auth.middleware');
const { loginLimiter, generalLimiter, passwordResetLimiter } = require('./rateLimiter.middleware');
const { errorHandler, notFoundHandler } = require('./errorHandler.middleware');

module.exports = {
  authenticate,
  optionalAuth,
  loginLimiter,
  generalLimiter,
  passwordResetLimiter,
  errorHandler,
  notFoundHandler
};
