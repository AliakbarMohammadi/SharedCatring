const { StatusCodes } = require('http-status-codes');
const AppError = require('./AppError');

/**
 * Validation error for invalid input data
 */
class ValidationError extends AppError {
  constructor(details = [], message = 'اطلاعات وارد شده نامعتبر است') {
    super(message, StatusCodes.BAD_REQUEST, 'ERR_VALIDATION', details);
  }

  /**
   * Create from Joi validation error
   * @param {Object} joiError - Joi validation error object
   * @returns {ValidationError}
   */
  static fromJoi(joiError) {
    const details = joiError.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));
    return new ValidationError(details);
  }

  /**
   * Create from express-validator errors
   * @param {Array} errors - express-validator errors array
   * @returns {ValidationError}
   */
  static fromExpressValidator(errors) {
    const details = errors.map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    return new ValidationError(details);
  }
}

module.exports = ValidationError;
