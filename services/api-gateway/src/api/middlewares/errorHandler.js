const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Proxy errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: {
        code: 'ERR_1008',
        message: 'سرویس در حال حاضر در دسترس نیست',
        details: []
      }
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'ERR_1000';
  const message = err.message || 'خطای داخلی سرور. لطفاً بعداً تلاش کنید';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details: err.details || []
    }
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_1002',
      message: 'مسیر درخواستی یافت نشد',
      details: []
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
