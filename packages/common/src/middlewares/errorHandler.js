const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../errors');

/**
 * Standard error handler middleware
 * Converts all errors to standard JSON response format
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Handle operational errors (known errors)
  if (err instanceof AppError || err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Joi validation errors
  if (err.name === 'ValidationError' && err.isJoi) {
    const details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'اطلاعات وارد شده نامعتبر است',
        details,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const details = err.errors?.map(e => ({
      field: e.path,
      message: e.message
    })) || [];

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'اطلاعات وارد شده نامعتبر است',
        details,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'MongooseValidationError') {
    const details = Object.values(err.errors || {}).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'اطلاعات وارد شده نامعتبر است',
        details,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'ERR_INVALID_TOKEN',
        message: 'توکن نامعتبر است',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'ERR_TOKEN_EXPIRED',
        message: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle unknown errors (500)
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: 'ERR_INTERNAL',
      message: 'خطای داخلی سرور. لطفاً بعداً تلاش کنید',
      details: process.env.NODE_ENV === 'development' ? [{ message: err.message }] : [],
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Not found handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      code: 'ERR_NOT_FOUND',
      message: 'مسیر درخواستی یافت نشد',
      details: [{ path: req.originalUrl, method: req.method }],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
