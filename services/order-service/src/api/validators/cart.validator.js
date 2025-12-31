const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'any.required': '{#label} الزامی است',
  'number.base': '{#label} باید عدد باشد',
  'number.min': '{#label} باید حداقل {#limit} باشد',
  'string.guid': '{#label} باید یک UUID معتبر باشد'
};

const addItemSchema = Joi.object({
  foodId: Joi.string().uuid().required().label('شناسه غذا').messages(messages),
  foodName: Joi.string().max(255).required().label('نام غذا').messages(messages),
  quantity: Joi.number().integer().min(1).required().label('تعداد').messages(messages),
  unitPrice: Joi.number().min(0).required().label('قیمت واحد').messages(messages),
  notes: Joi.string().max(500).optional().allow('').label('یادداشت').messages(messages)
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).optional().label('تعداد').messages(messages),
  notes: Joi.string().max(500).optional().allow('').label('یادداشت').messages(messages)
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
  validateAddItem: validate(addItemSchema),
  validateUpdateItem: validate(updateItemSchema)
};
