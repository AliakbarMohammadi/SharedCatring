const Joi = require('joi');

const msg = { 'string.empty': '{#label} نمی‌تواند خالی باشد', 'any.required': '{#label} الزامی است' };

const createDeptSchema = Joi.object({
  name: Joi.string().max(100).required().label('نام دپارتمان').messages(msg),
  code: Joi.string().max(20).optional().label('کد').messages(msg),
  parentId: Joi.string().uuid().optional().allow(null).label('دپارتمان والد').messages(msg),
  managerUserId: Joi.string().uuid().optional().label('مدیر').messages(msg),
  monthlyBudget: Joi.number().min(0).optional().label('بودجه ماهانه').messages(msg),
  isActive: Joi.boolean().optional().label('فعال').messages(msg)
});

const updateDeptSchema = createDeptSchema.fork(['name'], s => s.optional());

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'ERR_VALIDATION', message: 'اطلاعات نامعتبر است', details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })) } });
  }
  req.body = value;
  next();
};

module.exports = { validateCreateDept: validate(createDeptSchema), validateUpdateDept: validate(updateDeptSchema) };
