const { StatusCodes } = require('http-status-codes');
const AppError = require('./AppError');

/**
 * Forbidden error for authorization failures
 */
class ForbiddenError extends AppError {
  constructor(message = 'شما اجازه دسترسی به این بخش را ندارید', errorCode = 'ERR_FORBIDDEN') {
    super(message, StatusCodes.FORBIDDEN, errorCode);
  }

  /**
   * Create for insufficient permissions
   */
  static insufficientPermissions(requiredPermission = null) {
    const message = requiredPermission 
      ? `شما دسترسی ${requiredPermission} را ندارید`
      : 'شما دسترسی لازم برای این عملیات را ندارید';
    return new ForbiddenError(message, 'ERR_INSUFFICIENT_PERMISSIONS');
  }

  /**
   * Create for resource ownership
   */
  static notOwner() {
    return new ForbiddenError('شما مالک این منبع نیستید', 'ERR_NOT_OWNER');
  }
}

module.exports = ForbiddenError;
