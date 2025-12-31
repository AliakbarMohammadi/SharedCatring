const Joi = require('joi');

const validateUpload = (req, res, next) => {
  const schema = Joi.object({
    isPublic: Joi.boolean().messages({
      'boolean.base': 'مقدار isPublic باید true یا false باشد'
    }),
    referenceType: Joi.string().max(50).messages({
      'string.max': 'نوع مرجع نمی‌تواند بیشتر از ۵۰ کاراکتر باشد'
    }),
    referenceId: Joi.string().uuid().messages({
      'string.guid': 'شناسه مرجع نامعتبر است'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
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

const validateFileId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().uuid().required().messages({
      'any.required': 'شناسه فایل الزامی است',
      'string.guid': 'شناسه فایل نامعتبر است'
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

const validateQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'شماره صفحه باید عدد باشد',
      'number.min': 'شماره صفحه باید حداقل ۱ باشد'
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'تعداد باید عدد باشد',
      'number.min': 'تعداد باید حداقل ۱ باشد',
      'number.max': 'تعداد نمی‌تواند بیشتر از ۱۰۰ باشد'
    }),
    category: Joi.string().valid('image', 'document', 'spreadsheet', 'other').messages({
      'any.only': 'دسته‌بندی نامعتبر است'
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

module.exports = {
  validateUpload,
  validateFileId,
  validateQuery
};
