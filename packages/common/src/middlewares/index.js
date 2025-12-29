const { errorHandler, notFoundHandler } = require('./errorHandler');
const requestLogger = require('./requestLogger');

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger
};
