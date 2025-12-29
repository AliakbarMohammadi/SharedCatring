const Joi = require('joi');

const msg = { 'string.empty': '{#label} نمی‌تواند خالی باشد', 'any.required': '{#label} الزامی است' };

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createShiftSchema = Joi.object({
  name: Joi.string().max(50).required().label('نام شیفت').messages(msg),
  deliveryTime: Joi.string().pattern(timePattern).required().label('زمان تحویل').messages({ ...msg, 'string.pattern.base': 'فرمت زمان نامعتبر است (HH:MM)' }),
  orderDeadline: Joi.string().pattern(timePattern).required().label('مهلت سفارش').messages({ ...msg, 'string.pattern.base': 'فرمت زمان نامعتبر است (HH:MM)' }),
  isActive: Joi.boolean().optional().label('فعال').messages(msg)
});

const updateShiftSchema = createShiftSchema.fork(['name', 'deliveryTime', 'orderDeadline'], s => s.optional());

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'ERR_VALIDATION', message: 'اطلاعات نامعتبر است', details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })) } });
  }
  req.body = value;
  next();
};

module.exports = { validateCreateShift: validate(createShiftSchema), validateUpdateShift: validate(updateShiftSchema) };
