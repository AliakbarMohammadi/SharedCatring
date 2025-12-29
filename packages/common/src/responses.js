const { StatusCodes } = require('http-status-codes');
const messages = require('./messages');

/**
 * Standard success response
 */
const successResponse = (res, data = null, message = messages.success.general, meta = null, statusCode = StatusCodes.OK) => {
  const response = {
    success: true,
    data,
    message
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 */
const createdResponse = (res, data = null, message = messages.success.created) => {
  return successResponse(res, data, message, null, StatusCodes.CREATED);
};

/**
 * Paginated response
 */
const paginatedResponse = (res, data, pagination, message = messages.success.fetched) => {
  const meta = {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: Math.ceil(pagination.total / pagination.limit)
  };

  return successResponse(res, data, message, meta);
};

/**
 * No content response (204)
 */
const noContentResponse = (res) => {
  return res.status(StatusCodes.NO_CONTENT).send();
};

/**
 * Error response
 */
const errorResponse = (res, error) => {
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const errorCode = error.errorCode || 'ERR_1000';
  const message = error.message || messages.errors.internal;
  const details = error.details || [];

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details
    }
  });
};

/**
 * Validation error response
 */
const validationErrorResponse = (res, errors) => {
  return res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    error: {
      code: 'ERR_1001',
      message: messages.validation.invalidFormat,
      details: errors
    }
  });
};

module.exports = {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse,
  errorResponse,
  validationErrorResponse
};
