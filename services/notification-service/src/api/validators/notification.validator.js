const Joi = require('joi');

const sendNotificationSchema = Joi.object({
  userId: Joi.string().required().messages({
    'any.required': 'شناسه کاربر الزامی است'
  }),
  type: Joi.string().valid('email', 'sms', 'push', 'in_app').required().messages({
    'any.required': 'نوع اعلان الزامی است',
    'any.only': 'نوع اعلان نامعتبر است'
  }),
  category: Joi.string().valid('order', 'payment', 'wallet', 'company', 'system', 'promotion').default('system'),
  title: Joi.string().max(200).required().messages({
    'any.required': 'عنوان اعلان الزامی است'
  }),
  body: Joi.string().max(2000).required().messages({
    'any.required': 'متن اعلان الزامی است'
  }),
  data: Joi.object(),
  templateName: Joi.string(),
  variables: Joi.object(),
  recipient: Joi.object({
    email: Joi.string().email(),
    phone: Joi.string()
  })
});

const updatePreferencesSchema = Joi.object({
  email: Joi.object({
    enabled: Joi.boolean(),
    address: Joi.string().email()
  }),
  sms: Joi.object({
    enabled: Joi.boolean(),
    phone: Joi.string()
  }),
  push: Joi.object({
    enabled: Joi.boolean()
  }),
  inApp: Joi.object({
    enabled: Joi.boolean()
  }),
  categories: Joi.object({
    order: Joi.boolean(),
    payment: Joi.boolean(),
    wallet: Joi.boolean(),
    company: Joi.boolean(),
    system: Joi.boolean(),
    promotion: Joi.boolean()
  }),
  quietHours: Joi.object({
    enabled: Joi.boolean(),
    start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('email', 'sms', 'push', 'in_app'),
  status: Joi.string().valid('pending', 'sent', 'failed', 'read'),
  category: Joi.string().valid('order', 'payment', 'wallet', 'company', 'system', 'promotion')
});

const validate = (schema) => {
  return (req, res, next) => {
    const dataToValidate = schema === querySchema ? req.query : req.body;
    const { error, value } = schema.validate(dataToValidate, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION',
          message: 'خطا در اعتبارسنجی داده‌ها',
          details,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (schema === querySchema) {
      req.query = value;
    } else {
      req.body = value;
    }
    next();
  };
};

module.exports = {
  validateSendNotification: validate(sendNotificationSchema),
  validateUpdatePreferences: validate(updatePreferencesSchema),
  validateQuery: validate(querySchema)
};
