const Joi = require('joi');

const msg = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'any.required': '{#label} الزامی است',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'any.only': '{#label} نامعتبر است'
};

const createCompanySchema = Joi.object({
  name: Joi.string().max(255).required().label('نام شرکت').messages(msg),
  legalName: Joi.string().max(255).optional().label('نام حقوقی').messages(msg),
  registrationNumber: Joi.string().max(50).optional().label('شماره ثبت').messages(msg),
  taxId: Joi.string().max(20).optional().label('شناسه مالیاتی').messages(msg),
  adminUserId: Joi.string().uuid().required().label('مدیر شرکت').messages(msg),
  address: Joi.string().optional().label('آدرس').messages(msg),
  city: Joi.string().max(100).optional().label('شهر').messages(msg),
  phone: Joi.string().max(15).optional().label('تلفن').messages(msg),
  email: Joi.string().email().optional().label('ایمیل').messages(msg),
  contractType: Joi.string().valid('prepaid', 'postpaid', 'credit').optional().label('نوع قرارداد').messages(msg),
  contractStartDate: Joi.date().optional().label('تاریخ شروع قرارداد').messages(msg),
  contractEndDate: Joi.date().optional().label('تاریخ پایان قرارداد').messages(msg),
  creditLimit: Joi.number().min(0).optional().label('سقف اعتبار').messages(msg)
});

const updateCompanySchema = createCompanySchema.fork(['name', 'adminUserId'], s => s.optional());

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'reviewing', 'approved', 'active', 'rejected', 'suspended').required().label('وضعیت').messages(msg)
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: { code: 'ERR_VALIDATION', message: 'اطلاعات وارد شده نامعتبر است', details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })) }
    });
  }
  req.body = value;
  next();
};

module.exports = {
  validateCreateCompany: validate(createCompanySchema),
  validateUpdateCompany: validate(updateCompanySchema),
  validateUpdateStatus: validate(updateStatusSchema)
};
