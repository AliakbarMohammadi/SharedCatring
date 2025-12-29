const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'array.base': '{#label} باید یک آرایه باشد',
  'any.only': '{#label} نامعتبر است'
};

const updatePreferenceSchema = Joi.object({
  dietaryRestrictions: Joi.array().items(Joi.string()).optional().label('محدودیت‌های غذایی').messages(messages),
  allergies: Joi.array().items(Joi.string()).optional().label('آلرژی‌ها').messages(messages),
  favoriteFoods: Joi.array().items(Joi.string().uuid()).optional().label('غذاهای مورد علاقه').messages(messages),
  notificationSettings: Joi.object({
    email: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
    push: Joi.boolean().optional()
  }).optional().label('تنظیمات اعلان').messages(messages),
  language: Joi.string().valid('fa', 'en').optional().label('زبان')
    .messages({ ...messages, 'any.only': 'زبان باید fa یا en باشد' })
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'اطلاعات وارد شده نامعتبر است',
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
        timestamp: new Date().toISOString()
      }
    });
  }
  req.body = value;
  next();
};

module.exports = { validateUpdatePreference: validate(updatePreferenceSchema) };
