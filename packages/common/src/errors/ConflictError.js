const { StatusCodes } = require('http-status-codes');
const AppError = require('./AppError');

/**
 * Conflict error for duplicate resources
 */
class ConflictError extends AppError {
  constructor(message = 'این اطلاعات قبلاً ثبت شده است', errorCode = 'ERR_CONFLICT') {
    super(message, StatusCodes.CONFLICT, errorCode);
  }

  /**
   * Create for duplicate email
   */
  static duplicateEmail() {
    return new ConflictError('این ایمیل قبلاً ثبت شده است', 'ERR_DUPLICATE_EMAIL');
  }

  /**
   * Create for duplicate phone
   */
  static duplicatePhone() {
    return new ConflictError('این شماره تلفن قبلاً ثبت شده است', 'ERR_DUPLICATE_PHONE');
  }

  /**
   * Create for duplicate resource
   */
  static duplicate(resource) {
    return new ConflictError(`این ${resource} قبلاً ثبت شده است`, 'ERR_DUPLICATE');
  }
}

module.exports = ConflictError;
