const logger = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('خطای سرور', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'اطلاعات وارد شده نامعتبر است',
        details,
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

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'ERR_DUPLICATE',
        message: `این ${field} قبلاً ثبت شده است`,
        details: [{ field, message: 'مقدار تکراری' }],
        timestamp: new Date().toISOString()
      }
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERR_UNKNOWN',
        message: err.message,
        details: err.details || [],
        timestamp: new Date().toISOString()
      }
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: 'ERR_SERVER',
      message: 'خطای داخلی سرور',
      details: [],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
