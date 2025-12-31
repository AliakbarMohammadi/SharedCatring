const logger = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('خطای سرور', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERR_APPLICATION',
        message: err.message,
        details: err.details || [],
        timestamp: new Date().toISOString()
      }
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی داده‌ها',
        details: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        })),
        timestamp: new Date().toISOString()
      }
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'ERR_DUPLICATE',
        message: 'رکورد تکراری وجود دارد',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_INVALID_ID',
        message: 'شناسه نامعتبر است',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'ERR_INTERNAL',
      message: 'خطای داخلی سرور',
      details: [],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
