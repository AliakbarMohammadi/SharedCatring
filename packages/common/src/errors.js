const { StatusCodes } = require('http-status-codes');
const { ERROR_CODES } = require('./constants');
const messages = require('./messages');

class AppError extends Error {
  constructor(message, statusCode, errorCode, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details
      }
    };
  }
}

class ValidationError extends AppError {
  constructor(details = [], message = messages.validation.invalidFormat) {
    super(message, StatusCodes.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

class NotFoundError extends AppError {
  constructor(message = messages.errors.notFound) {
    super(message, StatusCodes.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = messages.auth.unauthorized, errorCode = ERROR_CODES.UNAUTHORIZED) {
    super(message, StatusCodes.UNAUTHORIZED, errorCode);
  }
}

class ForbiddenError extends AppError {
  constructor(message = messages.auth.forbidden) {
    super(message, StatusCodes.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }
}

class ConflictError extends AppError {
  constructor(message = messages.errors.conflict) {
    super(message, StatusCodes.CONFLICT, ERROR_CODES.CONFLICT);
  }
}

class BadRequestError extends AppError {
  constructor(message = messages.errors.badRequest, errorCode = ERROR_CODES.BAD_REQUEST) {
    super(message, StatusCodes.BAD_REQUEST, errorCode);
  }
}

class InternalError extends AppError {
  constructor(message = messages.errors.internal) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
  }
}

class RateLimitError extends AppError {
  constructor(message = messages.errors.rateLimitExceeded) {
    super(message, StatusCodes.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = messages.errors.serviceUnavailable) {
    super(message, StatusCodes.SERVICE_UNAVAILABLE, ERROR_CODES.SERVICE_UNAVAILABLE);
  }
}

// Auth specific errors
class InvalidCredentialsError extends UnauthorizedError {
  constructor(message = messages.auth.invalidCredentials) {
    super(message, ERROR_CODES.INVALID_CREDENTIALS);
  }
}

class TokenExpiredError extends UnauthorizedError {
  constructor(message = messages.auth.tokenExpired) {
    super(message, ERROR_CODES.TOKEN_EXPIRED);
  }
}

class TokenInvalidError extends UnauthorizedError {
  constructor(message = messages.auth.tokenInvalid) {
    super(message, ERROR_CODES.TOKEN_INVALID);
  }
}

// Payment specific errors
class InsufficientBalanceError extends BadRequestError {
  constructor(message = messages.payment.insufficientBalance) {
    super(message, ERROR_CODES.INSUFFICIENT_BALANCE);
  }
}

class PaymentFailedError extends BadRequestError {
  constructor(message = messages.payment.failed) {
    super(message, ERROR_CODES.PAYMENT_FAILED);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  InternalError,
  RateLimitError,
  ServiceUnavailableError,
  InvalidCredentialsError,
  TokenExpiredError,
  TokenInvalidError,
  InsufficientBalanceError,
  PaymentFailedError
};
