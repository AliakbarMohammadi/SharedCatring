const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'ایمیل نامعتبر است',
    'any.required': 'ایمیل الزامی است'
  }),
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'نام باید حداقل ۲ کاراکتر باشد',
    'any.required': 'نام الزامی است'
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'نام خانوادگی باید حداقل ۲ کاراکتر باشد',
    'any.required': 'نام خانوادگی الزامی است'
  }),
  phone: Joi.string().pattern(/^(\+98|0)?9\d{9}$/).messages({
    'string.pattern.base': 'شماره تلفن نامعتبر است'
  }),
  nationalCode: Joi.string().length(10).pattern(/^\d+$/).messages({
    'string.length': 'کد ملی باید ۱۰ رقم باشد',
    'string.pattern.base': 'کد ملی نامعتبر است'
  }),
  role: Joi.string().valid('super_admin', 'company_admin', 'company_manager', 'employee', 'kitchen_staff', 'delivery_staff'),
  companyId: Joi.string().uuid(),
  departmentId: Joi.string().uuid(),
  status: Joi.string().valid('active', 'inactive', 'pending', 'suspended')
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100),
  phone: Joi.string().pattern(/^(\+98|0)?9\d{9}$/),
  nationalCode: Joi.string().length(10).pattern(/^\d+$/),
  role: Joi.string().valid('super_admin', 'company_admin', 'company_manager', 'employee', 'kitchen_staff', 'delivery_staff'),
  companyId: Joi.string().uuid().allow(null),
  departmentId: Joi.string().uuid().allow(null),
  avatar: Joi.string().uri().allow(null),
  preferences: Joi.object(),
  metadata: Joi.object()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').required().messages({
    'any.required': 'وضعیت الزامی است',
    'any.only': 'وضعیت نامعتبر است'
  })
});

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
          code: 'ERR_1001',
          message: 'فرمت نامعتبر است',
          details
        }
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  validate
};
