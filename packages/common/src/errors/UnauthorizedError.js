const { StatusCodes } = require('http-status-codes');
const AppError = require('./AppError');

/**
 * Unauthorized error for authentication failures
 */
class UnauthorizedError extends AppError {
  constructor(message = 'برای دسترسی به این بخش باید وارد حساب کاربری خود شوید', errorCode = 'ERR_UNAUTHORIZED') {
    super(message, StatusCodes.UNAUTHORIZED, errorCode);
  }

  /**
   * Create for invalid credentials
   */
  static invalidCredentials() {
    return new UnauthorizedError('نام کاربری یا رمز عبور اشتباه است', 'ERR_INVALID_CREDENTIALS');
  }

  /**
   * Create for expired token
   */
  static tokenExpired() {
    return new UnauthorizedError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید', 'ERR_TOKEN_EXPIRED');
  }

  /**
   * Create for invalid token
   */
  static invalidToken() {
    return new UnauthorizedError('توکن نامعتبر است', 'ERR_INVALID_TOKEN');
  }
}

module.exports = UnauthorizedError;
