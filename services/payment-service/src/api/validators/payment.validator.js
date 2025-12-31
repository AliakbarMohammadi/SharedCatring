const Joi = require('joi');

const createPaymentSchema = Joi.object({
  orderId: Joi.string().uuid(),
  invoiceId: Joi.string().uuid(),
  amount: Joi.number().min(1000).required().messages({
    'number.min': 'حداقل مبلغ پرداخت ۱۰۰۰ تومان است',
    'any.required': 'مبلغ پرداخت الزامی است'
  }),
  gateway: Joi.string().valid('zarinpal', 'idpay').default('zarinpal'),
  method: Joi.string().valid('online', 'wallet', 'card', 'cash').default('online'),
  description: Joi.string().max(500),
  metadata: Joi.object()
}).or('orderId', 'invoiceId').messages({
  'object.missing': 'شناسه سفارش یا فاکتور الزامی است'
});

const refundSchema = Joi.object({
  reason: Joi.string().max(500).required().messages({
    'any.required': 'دلیل استرداد الزامی است'
  })
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded'),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso()
});

const validate = (schema) => {
  return (req, res, next) => {
    const dataToValidate = schema === querySchema ? req.query : req.body;
    const { error, value } = schema.validate(dataToValidate, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: translateError(detail)
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

const translateError = (detail) => {
  const field = detail.path.join('.');
  const type = detail.type;
  
  const messages = {
    'any.required': `فیلد ${field} الزامی است`,
    'string.empty': `فیلد ${field} نمی‌تواند خالی باشد`,
    'string.max': `فیلد ${field} بیش از حد مجاز است`,
    'string.uuid': `فرمت ${field} نامعتبر است`,
    'number.min': `مقدار ${field} کمتر از حد مجاز است`,
    'number.base': `فیلد ${field} باید عدد باشد`,
    'any.only': `مقدار ${field} نامعتبر است`,
    'object.missing': 'شناسه سفارش یا فاکتور الزامی است'
  };
  
  return detail.message || messages[type] || `خطا در فیلد ${field}`;
};

module.exports = {
  validateCreatePayment: validate(createPaymentSchema),
  validateRefund: validate(refundSchema),
  validateQuery: validate(querySchema)
};
