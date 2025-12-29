const { StatusCodes } = require('http-status-codes');

/**
 * Standard API response formatter
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const success = (res, data = null, message = 'عملیات با موفقیت انجام شد', statusCode = StatusCodes.OK) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
const created = (res, data = null, message = 'با موفقیت ایجاد شد') => {
  return success(res, data, message, StatusCodes.CREATED);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} meta - Pagination metadata
 * @param {string} message - Success message
 */
const paginated = (res, data, meta, message = 'اطلاعات با موفقیت دریافت شد') => {
  return res.status(StatusCodes.OK).json({
    success: true,
    data,
    message,
    meta
  });
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 */
const noContent = (res) => {
  return res.status(StatusCodes.NO_CONTENT).send();
};

/**
 * Send deleted response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const deleted = (res, message = 'با موفقیت حذف شد') => {
  return success(res, null, message);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Array} details - Error details
 * @param {number} statusCode - HTTP status code
 */
const error = (res, code, message, details = [], statusCode = StatusCodes.BAD_REQUEST) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  success,
  created,
  paginated,
  noContent,
  deleted,
  error
};
