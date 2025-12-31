const Joi = require('joi');

const validateDateRange = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date().iso().messages({
      'date.format': 'فرمت تاریخ شروع نامعتبر است'
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
      'date.format': 'فرمت تاریخ پایان نامعتبر است',
      'date.min': 'تاریخ پایان باید بعد از تاریخ شروع باشد'
    }),
    groupBy: Joi.string().valid('day', 'week', 'month').messages({
      'any.only': 'گروه‌بندی باید یکی از مقادیر day، week یا month باشد'
    })
  });

  const { error } = schema.validate(req.query, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی پارامترها',
        details: error.details.map(d => d.message),
        timestamp: new Date().toISOString()
      }
    });
  }
  
  next();
};

const validateDailyReport = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().iso().messages({
      'date.format': 'فرمت تاریخ نامعتبر است'
    })
  });

  const { error } = schema.validate(req.query, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی پارامترها',
        details: error.details.map(d => d.message),
        timestamp: new Date().toISOString()
      }
    });
  }
  
  next();
};

const validateMonthlyReport = (req, res, next) => {
  const schema = Joi.object({
    year: Joi.number().integer().min(1400).max(1450).messages({
      'number.base': 'سال باید عدد باشد',
      'number.min': 'سال باید بزرگتر از ۱۴۰۰ باشد',
      'number.max': 'سال باید کوچکتر از ۱۴۵۰ باشد'
    }),
    month: Joi.number().integer().min(1).max(12).messages({
      'number.base': 'ماه باید عدد باشد',
      'number.min': 'ماه باید بین ۱ تا ۱۲ باشد',
      'number.max': 'ماه باید بین ۱ تا ۱۲ باشد'
    })
  });

  const { error } = schema.validate(req.query, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی پارامترها',
        details: error.details.map(d => d.message),
        timestamp: new Date().toISOString()
      }
    });
  }
  
  next();
};

const validatePopularItems = (req, res, next) => {
  const schema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'تعداد باید عدد باشد',
      'number.min': 'تعداد باید حداقل ۱ باشد',
      'number.max': 'تعداد نمی‌تواند بیشتر از ۱۰۰ باشد'
    }),
    startDate: Joi.date().iso().messages({
      'date.format': 'فرمت تاریخ شروع نامعتبر است'
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
      'date.format': 'فرمت تاریخ پایان نامعتبر است',
      'date.min': 'تاریخ پایان باید بعد از تاریخ شروع باشد'
    })
  });

  const { error } = schema.validate(req.query, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی پارامترها',
        details: error.details.map(d => d.message),
        timestamp: new Date().toISOString()
      }
    });
  }
  
  next();
};

const validateExport = (req, res, next) => {
  const schema = Joi.object({
    type: Joi.string().valid('daily', 'monthly', 'revenue', 'company', 'popular').required().messages({
      'any.required': 'نوع گزارش الزامی است',
      'any.only': 'نوع گزارش نامعتبر است'
    }),
    date: Joi.date().iso().messages({
      'date.format': 'فرمت تاریخ نامعتبر است'
    }),
    year: Joi.number().integer().min(1400).max(1450),
    month: Joi.number().integer().min(1).max(12),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    companyId: Joi.string().uuid().messages({
      'string.guid': 'شناسه شرکت نامعتبر است'
    }),
    limit: Joi.number().integer().min(1).max(100)
  });

  const { error } = schema.validate(req.query, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی پارامترها',
        details: error.details.map(d => d.message),
        timestamp: new Date().toISOString()
      }
    });
  }
  
  next();
};

const validateCompanyId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().uuid().required().messages({
      'any.required': 'شناسه شرکت الزامی است',
      'string.guid': 'شناسه شرکت نامعتبر است'
    })
  });

  const { error } = schema.validate(req.params, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'خطا در اعتبارسنجی پارامترها',
        details: error.details.map(d => d.message),
        timestamp: new Date().toISOString()
      }
    });
  }
  
  next();
};

module.exports = {
  validateDateRange,
  validateDailyReport,
  validateMonthlyReport,
  validatePopularItems,
  validateExport,
  validateCompanyId
};
