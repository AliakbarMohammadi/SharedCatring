const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.email': 'فرمت ایمیل نامعتبر است',
  'string.min': '{#label} باید حداقل {#limit} کاراکتر باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'string.pattern.base': '{#label} فرمت نامعتبر دارد',
  'any.required': '{#label} الزامی است',
  'any.only': '{#label} نامعتبر است',
  'string.guid': '{#label} باید یک UUID معتبر باشد'
};

const phonePattern = /^(\+98|0)?9\d{9}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

const createUserSchema = Joi.object({
  email: Joi.string().email().required().label('ایمیل').messages(messages),
  phone: Joi.string().pattern(phonePattern).optional().label('شماره موبایل')
    .messages({ ...messages, 'string.pattern.base': 'شماره موبایل نامعتبر است' }),
  // password: plain text password (validated)
  password: Joi.string().min(8).max(128).pattern(passwordPattern).label('رمز عبور')
    .messages({ ...messages, 'string.pattern.base': 'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک و عدد باشد' }),
  // passwordHash: pre-hashed password from auth-service (no validation needed)
  passwordHash: Joi.string().max(256).label('رمز عبور هش شده'),
  firstName: Joi.string().max(100).optional().label('نام').messages(messages),
  lastName: Joi.string().max(100).optional().label('نام خانوادگی').messages(messages),
  roleId: Joi.string().uuid().optional().label('نقش').messages(messages),
  role: Joi.string().optional().label('نام نقش'),
  companyId: Joi.string().uuid().optional().label('شرکت').messages(messages)
}).or('password', 'passwordHash'); // Either password or passwordHash is required

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional().label('ایمیل').messages(messages),
  phone: Joi.string().pattern(phonePattern).optional().allow(null).label('شماره موبایل')
    .messages({ ...messages, 'string.pattern.base': 'شماره موبایل نامعتبر است' }),
  firstName: Joi.string().max(100).optional().label('نام').messages(messages),
  lastName: Joi.string().max(100).optional().label('نام خانوادگی').messages(messages),
  companyId: Joi.string().uuid().optional().allow(null).label('شرکت').messages(messages)
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'suspended', 'pending').required().label('وضعیت')
    .messages({ ...messages, 'any.only': 'وضعیت باید یکی از مقادیر active، inactive، suspended یا pending باشد' })
});

const assignRoleSchema = Joi.object({
  roleId: Joi.string().uuid().label('شناسه نقش').messages(messages),
  role: Joi.string().valid('super_admin', 'company_admin', 'personal_user', 'kitchen_staff', 'employee', 'corporate_user').label('نام نقش').messages(messages)
}).or('roleId', 'role'); // Either roleId or role name is required

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().label('رمز عبور فعلی').messages(messages),
  newPassword: Joi.string().min(8).max(128).pattern(passwordPattern).required().label('رمز عبور جدید')
    .messages({ ...messages, 'string.pattern.base': 'رمز عبور جدید باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک و عدد باشد' }),
  // passwordHash: for service-to-service calls (auth-service)
  passwordHash: Joi.string().max(256).label('رمز عبور هش شده')
}).or('currentPassword', 'passwordHash'); // Either user change or service call

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

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
  validateCreateUser: validate(createUserSchema),
  validateUpdateUser: validate(updateUserSchema),
  validateUpdateStatus: validate(updateStatusSchema),
  validateAssignRole: validate(assignRoleSchema),
  validateChangePassword: validate(changePasswordSchema)
};
