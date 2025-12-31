const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  type: Joi.string().valid('instant', 'consolidated', 'proforma').default('instant'),
  companyId: Joi.string().uuid(),
  periodStart: Joi.date().iso(),
  periodEnd: Joi.date().iso().min(Joi.ref('periodStart')),
  items: Joi.array().items(
    Joi.object({
      orderId: Joi.string().uuid(),
      description: Joi.string().required().max(500),
      quantity: Joi.number().integer().min(1).required(),
      unitPrice: Joi.number().min(0).required()
    })
  ).min(1).required(),
  discount: Joi.number().min(0).default(0),
  taxRate: Joi.number().min(0).max(100),
  dueDate: Joi.date().iso(),
  notes: Joi.string().max(1000),
  customerName: Joi.string().max(255),
  customerEmail: Joi.string().email(),
  customerPhone: Joi.string().max(20),
  customerAddress: Joi.string().max(500)
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('issued', 'sent', 'paid', 'cancelled').required()
});

const consolidatedInvoiceSchema = Joi.object({
  companyId: Joi.string().uuid().required(),
  periodStart: Joi.date().iso().required(),
  periodEnd: Joi.date().iso().min(Joi.ref('periodStart')).required()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('draft', 'issued', 'sent', 'paid', 'cancelled'),
  type: Joi.string().valid('instant', 'consolidated', 'proforma'),
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
    'string.email': 'فرمت ایمیل نامعتبر است',
    'string.max': `فیلد ${field} بیش از حد مجاز است`,
    'string.uuid': `فرمت ${field} نامعتبر است`,
    'number.min': `مقدار ${field} کمتر از حد مجاز است`,
    'number.max': `مقدار ${field} بیشتر از حد مجاز است`,
    'number.base': `فیلد ${field} باید عدد باشد`,
    'array.min': `حداقل یک آیتم الزامی است`,
    'date.min': 'تاریخ پایان باید بعد از تاریخ شروع باشد',
    'any.only': `مقدار ${field} نامعتبر است`
  };
  
  return messages[type] || detail.message;
};

module.exports = {
  validateCreateInvoice: validate(createInvoiceSchema),
  validateUpdateStatus: validate(updateStatusSchema),
  validateConsolidatedInvoice: validate(consolidatedInvoiceSchema),
  validateQuery: validate(querySchema)
};
