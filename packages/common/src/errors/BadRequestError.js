const { StatusCodes } = require('http-status-codes');
const AppError = require('./AppError');

/**
 * Bad request error for invalid requests
 */
class BadRequestError extends AppError {
  constructor(message = 'درخواست نامعتبر است', errorCode = 'ERR_BAD_REQUEST', details = []) {
    super(message, StatusCodes.BAD_REQUEST, errorCode, details);
  }

  /**
   * Create for insufficient balance
   */
  static insufficientBalance() {
    return new BadRequestError('موجودی کافی نیست', 'ERR_INSUFFICIENT_BALANCE');
  }

  /**
   * Create for invalid status transition
   */
  static invalidStatusTransition(from, to) {
    return new BadRequestError(
      `تغییر وضعیت از "${from}" به "${to}" مجاز نیست`,
      'ERR_INVALID_STATUS_TRANSITION'
    );
  }

  /**
   * Create for deadline passed
   */
  static deadlinePassed() {
    return new BadRequestError('مهلت این عملیات به پایان رسیده است', 'ERR_DEADLINE_PASSED');
  }
}

module.exports = BadRequestError;
