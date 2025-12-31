const logger = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('خطای سرور', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_FILE_TOO_LARGE',
        message: 'حجم فایل بیش از حد مجاز است (حداکثر ۱۰ مگابایت)',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_UNEXPECTED_FILE',
        message: 'فیلد فایل نامعتبر است',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی داده‌ها',
        details: err.details || [err.message],
        timestamp: new Date().toISOString()
      }
    });
  }

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی داده‌ها',
        details: err.errors.map(e => e.message),
        timestamp: new Date().toISOString()
      }
    });
  }

  // Custom application errors
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

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: 'ERR_INTERNAL',
      message: 'خطای داخلی سرور',
      details: process.env.NODE_ENV === 'development' ? [err.message] : [],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
