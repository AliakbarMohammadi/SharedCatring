const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'any.required': '{#label} الزامی است',
  'any.only': '{#label} نامعتبر است'
};

const joinRequestSchema = Joi.object({
  message: Joi.string().max(500).optional().label('پیام').messages(messages)
});

const requestStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required().label('وضعیت')
    .messages({ ...messages, 'any.only': 'وضعیت باید approved یا rejected باشد' }),
  reason: Joi.string().max(500).optional().label('دلیل').messages(messages)
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
  validateJoinRequest: validate(joinRequestSchema),
  validateRequestStatus: validate(requestStatusSchema)
};
