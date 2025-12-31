const Joi = require('joi');
const config = require('../../config');

const topupSchema = Joi.object({
  amount: Joi.number()
    .min(config.wallet.minTopupAmount)
    .max(config.wallet.maxTopupAmount)
    .required()
    .messages({
      'number.min': `حداقل مبلغ شارژ ${config.wallet.minTopupAmount.toLocaleString('fa-IR')} تومان است`,
      'number.max': `حداکثر مبلغ شارژ ${config.wallet.maxTopupAmount.toLocaleString('fa-IR')} تومان است`,
      'any.required': 'مبلغ شارژ الزامی است'
    }),
  description: Joi.string().max(500)
});

const companyTopupSchema = Joi.object({
  amount: Joi.number().min(10000).required().messages({
    'number.min': 'حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است',
    'any.required': 'مبلغ شارژ الزامی است'
  }),
  description: Joi.string().max(500)
});

const allocateSchema = Joi.object({
  employeeUserId: Joi.string().uuid().required().messages({
    'any.required': 'شناسه کارمند الزامی است',
    'string.uuid': 'فرمت شناسه کارمند نامعتبر است'
  }),
  amount: Joi.number().min(1000).required().messages({
    'number.min': 'حداقل مبلغ تخصیص ۱,۰۰۰ تومان است',
    'any.required': 'مبلغ تخصیص الزامی است'
  }),
  description: Joi.string().max(500)
});

const deductSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  amount: Joi.number().min(1).required(),
  balanceType: Joi.string().valid('personal', 'company').default('personal'),
  referenceType: Joi.string().max(50),
  referenceId: Joi.string().uuid(),
  description: Joi.string().max(500)
});

const refundSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  amount: Joi.number().min(1).required(),
  balanceType: Joi.string().valid('personal', 'company').default('personal'),
  referenceType: Joi.string().max(50),
  referenceId: Joi.string().uuid(),
  description: Joi.string().max(500)
});

const checkBalanceSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  amount: Joi.number().min(1).required(),
  balanceType: Joi.string().valid('personal', 'company').default('personal')
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid(
    'topup_personal', 'topup_company', 'subsidy_allocation',
    'order_payment', 'order_refund', 'subsidy_expiry', 'withdrawal'
  ),
  balanceType: Joi.string().valid('personal', 'company'),
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
  validateTopup: validate(topupSchema),
  validateCompanyTopup: validate(companyTopupSchema),
  validateAllocate: validate(allocateSchema),
  validateDeduct: validate(deductSchema),
  validateRefund: validate(refundSchema),
  validateCheckBalance: validate(checkBalanceSchema),
  validateQuery: validate(querySchema)
};
