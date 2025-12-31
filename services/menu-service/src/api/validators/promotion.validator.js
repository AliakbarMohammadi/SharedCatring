const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'any.required': '{#label} الزامی است',
  'any.only': '{#label} نامعتبر است',
  'number.base': '{#label} باید عدد باشد',
  'number.min': '{#label} نمی‌تواند منفی باشد',
  'number.max': '{#label} نمی‌تواند بیشتر از {#limit} باشد',
  'date.base': '{#label} باید تاریخ معتبر باشد'
};

const createPromotionSchema = Joi.object({
  code: Joi.string().max(20).required().label('کد تخفیف').messages(messages),
  name: Joi.string().max(100).required().label('نام تخفیف').messages(messages),
  description: Joi.string().max(500).optional().allow('').label('توضیحات').messages(messages),
  type: Joi.string().valid('percentage', 'fixed').required().label('نوع تخفیف')
    .messages({ ...messages, 'any.only': 'نوع تخفیف باید percentage یا fixed باشد' }),
  value: Joi.number().min(0).required().label('مقدار تخفیف').messages(messages),
  minOrderAmount: Joi.number().min(0).optional().label('حداقل مبلغ سفارش').messages(messages),
  maxDiscount: Joi.number().min(0).optional().allow(null).label('حداکثر تخفیف').messages(messages),
  applicableItems: Joi.array().items(Joi.string().hex().length(24)).optional().label('غذاهای قابل اعمال').messages(messages),
  applicableCategories: Joi.array().items(Joi.string().hex().length(24)).optional().label('دسته‌بندی‌های قابل اعمال').messages(messages),
  startDate: Joi.date().required().label('تاریخ شروع').messages(messages),
  endDate: Joi.date().required().label('تاریخ پایان').messages(messages),
  usageLimit: Joi.number().min(1).optional().allow(null).label('محدودیت استفاده').messages(messages),
  isActive: Joi.boolean().optional().label('وضعیت فعال').messages(messages)
});

const updatePromotionSchema = Joi.object({
  code: Joi.string().max(20).optional().label('کد تخفیف').messages(messages),
  name: Joi.string().max(100).optional().label('نام تخفیف').messages(messages),
  description: Joi.string().max(500).optional().allow('').label('توضیحات').messages(messages),
  type: Joi.string().valid('percentage', 'fixed').optional().label('نوع تخفیف')
    .messages({ ...messages, 'any.only': 'نوع تخفیف باید percentage یا fixed باشد' }),
  value: Joi.number().min(0).optional().label('مقدار تخفیف').messages(messages),
  minOrderAmount: Joi.number().min(0).optional().label('حداقل مبلغ سفارش').messages(messages),
  maxDiscount: Joi.number().min(0).optional().allow(null).label('حداکثر تخفیف').messages(messages),
  applicableItems: Joi.array().items(Joi.string().hex().length(24)).optional().label('غذاهای قابل اعمال').messages(messages),
  applicableCategories: Joi.array().items(Joi.string().hex().length(24)).optional().label('دسته‌بندی‌های قابل اعمال').messages(messages),
  startDate: Joi.date().optional().label('تاریخ شروع').messages(messages),
  endDate: Joi.date().optional().label('تاریخ پایان').messages(messages),
  usageLimit: Joi.number().min(1).optional().allow(null).label('محدودیت استفاده').messages(messages),
  isActive: Joi.boolean().optional().label('وضعیت فعال').messages(messages)
});

const validatePromotionSchema = Joi.object({
  code: Joi.string().required().label('کد تخفیف').messages(messages),
  orderAmount: Joi.number().min(0).required().label('مبلغ سفارش').messages(messages),
  items: Joi.array().items(Joi.string().hex().length(24)).optional().label('آیتم‌ها').messages(messages),
  categoryIds: Joi.array().items(Joi.string().hex().length(24)).optional().label('دسته‌بندی‌ها').messages(messages)
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
  validateCreatePromotion: validate(createPromotionSchema),
  validateUpdatePromotion: validate(updatePromotionSchema),
  validatePromotion: validate(validatePromotionSchema)
};
