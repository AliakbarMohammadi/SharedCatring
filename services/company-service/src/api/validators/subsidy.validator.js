const Joi = require('joi');

const msg = { 'string.empty': '{#label} نمی‌تواند خالی باشد', 'any.required': '{#label} الزامی است' };

const createSubsidySchema = Joi.object({
  name: Joi.string().max(100).optional().label('نام قانون').messages(msg),
  // API fields (mapped in service)
  type: Joi.string().valid('percentage', 'fixed', 'mixed').optional().label('نوع قانون').messages(msg),
  value: Joi.number().min(0).optional().label('مقدار').messages(msg),
  maxAmount: Joi.number().min(0).optional().label('سقف').messages(msg),
  mealTypes: Joi.array().items(Joi.string()).optional().label('وعده‌ها').messages(msg),
  // Database fields (direct)
  ruleType: Joi.string().valid('percentage', 'fixed', 'mixed').optional().label('نوع قانون').messages(msg),
  percentage: Joi.number().min(0).max(100).optional().label('درصد').messages(msg),
  fixedAmount: Joi.number().min(0).optional().label('مبلغ ثابت').messages(msg),
  maxPerMeal: Joi.number().min(0).optional().label('سقف هر وعده').messages(msg),
  maxPerDay: Joi.number().min(0).optional().label('سقف روزانه').messages(msg),
  maxPerMonth: Joi.number().min(0).optional().label('سقف ماهانه').messages(msg),
  applicableMeals: Joi.array().items(Joi.string()).optional().label('وعده‌های قابل اعمال').messages(msg),
  startDate: Joi.date().optional().label('تاریخ شروع').messages(msg),
  endDate: Joi.date().optional().label('تاریخ پایان').messages(msg),
  isActive: Joi.boolean().optional().label('فعال').messages(msg),
  priority: Joi.number().integer().optional().label('اولویت').messages(msg)
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'ERR_VALIDATION', message: 'اطلاعات نامعتبر است', details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })) } });
  }
  req.body = value;
  next();
};

module.exports = { validateCreateSubsidy: validate(createSubsidySchema), validateUpdateSubsidy: validate(createSubsidySchema) };
