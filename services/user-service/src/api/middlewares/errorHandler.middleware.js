const logger = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'ERR_INTERNAL';
  const message = err.message || 'خطای داخلی سرور';

  if (statusCode === 500) {
    logger.error('خطای سرور', { error: err.message, stack: err.stack, path: req.path, method: req.method });
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message, details: err.details || [], timestamp: new Date().toISOString() }
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'ERR_NOT_FOUND', message: 'مسیر مورد نظر یافت نشد', details: [], timestamp: new Date().toISOString() }
  });
};

module.exports = { errorHandler, notFoundHandler };
