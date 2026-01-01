const Joi = require('joi');

/**
 * Persian validation messages
 * پیام‌های اعتبارسنجی فارسی
 */
const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.email': 'فرمت ایمیل نامعتبر است',
  'string.min': '{#label} باید حداقل {#limit} کاراکتر باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'string.pattern.base': '{#label} فرمت نامعتبر دارد',
  'any.required': '{#label} الزامی است',
  'any.only': '{#label} نامعتبر است'
};

/**
 * Password pattern
 * حداقل 8 کاراکتر، شامل حروف بزرگ، کوچک و عدد
 */
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

/**
 * Phone pattern (Iranian mobile)
 */
const phonePattern = /^(\+98|0)?9\d{9}$/;

/**
 * Register validation schema
 * اسکیمای اعتبارسنجی ثبت‌نام
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .label('ایمیل')
    .messages(messages),
  
  phone: Joi.string()
    .pattern(phonePattern)
    .optional()
    .label('شماره موبایل')
    .messages({
      ...messages,
      'string.pattern.base': 'شماره موبایل نامعتبر است (مثال: 09121234567)'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(passwordPattern)
    .required()
    .label('رمز عبور')
    .messages({
      ...messages,
      'string.pattern.base': 'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک و عدد باشد'
    }),
  
  firstName: Joi.string()
    .max(100)
    .optional()
    .label('نام')
    .messages(messages),
  
  lastName: Joi.string()
    .max(100)
    .optional()
    .label('نام خانوادگی')
    .messages(messages),
  
  role: Joi.string()
    .valid('personal_user', 'company_admin', 'company_employee')
    .default('personal_user')
    .label('نقش')
    .messages(messages)
});

/**
 * Login validation schema
 * اسکیمای اعتبارسنجی ورود
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .label('ایمیل')
    .messages(messages),
  
  password: Joi.string()
    .required()
    .label('رمز عبور')
    .messages(messages)
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .label('توکن')
    .messages(messages)
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .label('ایمیل')
    .messages(messages)
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .label('توکن')
    .messages(messages),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(passwordPattern)
    .required()
    .label('رمز عبور جدید')
    .messages({
      ...messages,
      'string.pattern.base': 'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک و عدد باشد'
    })
});

/**
 * Verify token validation schema
 */
const verifyTokenSchema = Joi.object({
  token: Joi.string()
    .required()
    .label('توکن')
    .messages(messages)
});

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema
 * @returns {Function}
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION',
          message: 'اطلاعات وارد شده نامعتبر است',
          details,
          timestamp: new Date().toISOString()
        }
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyTokenSchema,
  validate,
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateRefreshToken: validate(refreshTokenSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateVerifyToken: validate(verifyTokenSchema)
};
