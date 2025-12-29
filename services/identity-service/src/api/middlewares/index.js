const { errorHandler, notFoundHandler } = require('./errorHandler.middleware');
const { generalLimiter } = require('./rateLimiter.middleware');

module.exports = {
  errorHandler,
  notFoundHandler,
  generalLimiter
};
