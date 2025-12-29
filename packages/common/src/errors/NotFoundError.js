const { StatusCodes } = require('http-status-codes');
const AppError = require('./AppError');

/**
 * Not found error for missing resources
 */
class NotFoundError extends AppError {
  constructor(resource = 'منبع', message = null) {
    const errorMessage = message || `${resource} مورد نظر یافت نشد`;
    super(errorMessage, StatusCodes.NOT_FOUND, 'ERR_NOT_FOUND');
    this.resource = resource;
  }
}

module.exports = NotFoundError;
