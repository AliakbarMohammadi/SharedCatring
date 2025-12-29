const Joi = require('joi');

const msg = { 'string.empty': '{#label} نمی‌تواند خالی باشد', 'any.required': '{#label} الزامی است' };

const createEmpSchema = Joi.object({
  userId: Joi.string().uuid().required().label('شناسه کاربر').messages(msg),
  departmentId: Joi.string().uuid().optional().label('دپارتمان').messages(msg),
  employeeCode: Joi.string().max(50).optional().label('کد کارمندی').messages(msg),
  jobTitle: Joi.string().max(100).optional().label('سمت').messages(msg),
  shiftId: Joi.string().uuid().optional().label('شیفت').messages(msg),
  dailySubsidyLimit: Joi.number().min(0).optional().label('سقف یارانه روزانه').messages(msg),
  monthlySubsidyLimit: Joi.number().min(0).optional().label('سقف یارانه ماهانه').messages(msg),
  subsidyPercentage: Joi.number().min(0).max(100).optional().label('درصد یارانه').messages(msg),
  canOrder: Joi.boolean().optional().label('امکان سفارش').messages(msg),
  status: Joi.string().valid('active', 'inactive', 'suspended').optional().label('وضعیت').messages(msg)
});

const updateEmpSchema = createEmpSchema.fork(['userId'], s => s.optional());

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'ERR_VALIDATION', message: 'اطلاعات نامعتبر است', details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })) } });
  }
  req.body = value;
  next();
};

module.exports = { validateCreateEmp: validate(createEmpSchema), validateUpdateEmp: validate(updateEmpSchema) };
