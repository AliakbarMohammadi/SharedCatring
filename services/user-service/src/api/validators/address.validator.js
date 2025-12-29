const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'any.required': '{#label} الزامی است',
  'number.base': '{#label} باید یک عدد باشد'
};

const createAddressSchema = Joi.object({
  title: Joi.string().max(100).optional().label('عنوان').messages(messages),
  address: Joi.string().required().label('آدرس').messages(messages),
  city: Joi.string().max(100).optional().label('شهر').messages(messages),
  postalCode: Joi.string().max(10).optional().label('کد پستی').messages(messages),
  latitude: Joi.number().min(-90).max(90).optional().label('عرض جغرافیایی').messages(messages),
  longitude: Joi.number().min(-180).max(180).optional().label('طول جغرافیایی').messages(messages),
  isDefault: Joi.boolean().optional().label('آدرس پیش‌فرض').messages(messages)
});

const updateAddressSchema = Joi.object({
  title: Joi.string().max(100).optional().label('عنوان').messages(messages),
  address: Joi.string().optional().label('آدرس').messages(messages),
  city: Joi.string().max(100).optional().label('شهر').messages(messages),
  postalCode: Joi.string().max(10).optional().label('کد پستی').messages(messages),
  latitude: Joi.number().min(-90).max(90).optional().allow(null).label('عرض جغرافیایی').messages(messages),
  longitude: Joi.number().min(-180).max(180).optional().allow(null).label('طول جغرافیایی').messages(messages),
  isDefault: Joi.boolean().optional().label('آدرس پیش‌فرض').messages(messages)
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

module.exports = {
  validateCreateAddress: validate(createAddressSchema),
  validateUpdateAddress: validate(updateAddressSchema)
};
