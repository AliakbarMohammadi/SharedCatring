const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.min': '{#label} باید حداقل {#limit} کاراکتر باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'any.required': '{#label} الزامی است',
  'string.guid': '{#label} باید یک UUID معتبر باشد',
  'array.min': '{#label} باید حداقل {#limit} آیتم داشته باشد'
};

const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().label('نام نقش').messages(messages),
  description: Joi.string().max(500).optional().label('توضیحات').messages(messages)
});

const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().label('نام نقش').messages(messages),
  description: Joi.string().max(500).optional().allow(null).label('توضیحات').messages(messages)
});

const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.string().uuid()).min(1).required().label('دسترسی‌ها')
    .messages({ ...messages, 'array.min': 'حداقل یک دسترسی باید انتخاب شود' })
});

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
  validateCreateRole: validate(createRoleSchema),
  validateUpdateRole: validate(updateRoleSchema),
  validateAssignPermissions: validate(assignPermissionsSchema)
};
