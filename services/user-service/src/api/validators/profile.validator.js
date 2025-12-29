const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'string.pattern.base': '{#label} فرمت نامعتبر دارد',
  'any.only': '{#label} نامعتبر است',
  'date.base': '{#label} باید یک تاریخ معتبر باشد'
};

const nationalCodePattern = /^\d{10}$/;

const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(100).optional().label('نام').messages(messages),
  lastName: Joi.string().max(100).optional().label('نام خانوادگی').messages(messages),
  nationalCode: Joi.string().pattern(nationalCodePattern).optional().label('کد ملی')
    .messages({ ...messages, 'string.pattern.base': 'کد ملی باید ۱۰ رقم باشد' }),
  birthDate: Joi.date().optional().label('تاریخ تولد').messages(messages),
  gender: Joi.string().valid('male', 'female', 'other').optional().label('جنسیت')
    .messages({ ...messages, 'any.only': 'جنسیت باید male، female یا other باشد' })
});

const updateAvatarSchema = Joi.object({
  avatarUrl: Joi.string().uri().max(500).required().label('آدرس آواتار').messages(messages)
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
  validateUpdateProfile: validate(updateProfileSchema),
  validateUpdateAvatar: validate(updateAvatarSchema)
};
