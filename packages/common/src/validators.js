const Joi = require('joi');
const messages = require('./messages');

// Persian phone number regex (Iranian mobile numbers)
const PERSIAN_PHONE_REGEX = /^(\+98|0)?9\d{9}$/;

// Persian national code regex
const NATIONAL_CODE_REGEX = /^\d{10}$/;

// Custom Joi extensions for Persian validation
const customJoi = Joi.extend((joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.persianPhone': messages.validation.invalidPhone,
    'string.nationalCode': 'کد ملی نامعتبر است'
  },
  rules: {
    persianPhone: {
      validate(value, helpers) {
        if (!PERSIAN_PHONE_REGEX.test(value)) {
          return helpers.error('string.persianPhone');
        }
        return value;
      }
    },
    nationalCode: {
      validate(value, helpers) {
        if (!NATIONAL_CODE_REGEX.test(value)) {
          return helpers.error('string.nationalCode');
        }
        // Validate Iranian national code checksum
        const check = parseInt(value[9]);
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          sum += parseInt(value[i]) * (10 - i);
        }
        const remainder = sum % 11;
        const isValid = (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
        if (!isValid) {
          return helpers.error('string.nationalCode');
        }
        return value;
      }
    }
  }
}));

// Common validation schemas
const schemas = {
  // ID validation
  id: Joi.string().uuid().required().messages({
    'string.guid': 'شناسه نامعتبر است',
    'any.required': 'شناسه الزامی است'
  }),

  mongoId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'شناسه نامعتبر است',
    'string.length': 'شناسه نامعتبر است',
    'any.required': 'شناسه الزامی است'
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'شماره صفحه باید عدد باشد',
      'number.min': 'شماره صفحه باید حداقل ۱ باشد'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'تعداد در صفحه باید عدد باشد',
      'number.min': 'تعداد در صفحه باید حداقل ۱ باشد',
      'number.max': 'تعداد در صفحه نمی‌تواند بیشتر از ۱۰۰ باشد'
    }),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Email
  email: Joi.string().email().required().messages({
    'string.email': messages.validation.invalidEmail,
    'any.required': 'ایمیل الزامی است'
  }),

  // Phone
  phone: customJoi.string().persianPhone().required().messages({
    'any.required': 'شماره تلفن الزامی است'
  }),

  // Password
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'رمز عبور باید حداقل ۸ کاراکتر باشد',
    'string.max': 'رمز عبور نمی‌تواند بیشتر از ۱۲۸ کاراکتر باشد',
    'any.required': 'رمز عبور الزامی است'
  }),

  // National Code
  nationalCode: customJoi.string().nationalCode().messages({
    'any.required': 'کد ملی الزامی است'
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date().iso().required().messages({
      'date.format': 'فرمت تاریخ شروع نامعتبر است',
      'any.required': 'تاریخ شروع الزامی است'
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
      'date.format': 'فرمت تاریخ پایان نامعتبر است',
      'date.min': 'تاریخ پایان باید بعد از تاریخ شروع باشد',
      'any.required': 'تاریخ پایان الزامی است'
    })
  }),

  // Amount (for financial transactions)
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'مبلغ باید عدد باشد',
    'number.positive': 'مبلغ باید مثبت باشد',
    'any.required': 'مبلغ الزامی است'
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
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
          code: 'ERR_1001',
          message: messages.validation.invalidFormat,
          details
        }
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = {
  Joi: customJoi,
  schemas,
  validate,
  PERSIAN_PHONE_REGEX,
  NATIONAL_CODE_REGEX
};
