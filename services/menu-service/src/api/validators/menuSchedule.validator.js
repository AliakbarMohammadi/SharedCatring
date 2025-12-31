const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'any.required': '{#label} الزامی است',
  'any.only': '{#label} نامعتبر است',
  'number.base': '{#label} باید عدد باشد',
  'number.min': '{#label} باید حداقل {#limit} باشد',
  'date.base': '{#label} باید تاریخ معتبر باشد',
  'array.min': '{#label} باید حداقل {#limit} آیتم داشته باشد'
};

const menuItemSchema = Joi.object({
  foodId: Joi.string().hex().length(24).required().label('شناسه غذا'),
  maxQuantity: Joi.number().min(1).required().label('حداکثر تعداد'),
  remainingQuantity: Joi.number().min(0).optional().label('تعداد باقیمانده'),
  specialPrice: Joi.number().min(0).optional().allow(null).label('قیمت ویژه')
});

const createScheduleSchema = Joi.object({
  date: Joi.date().required().label('تاریخ').messages(messages),
  mealType: Joi.string().valid('breakfast', 'lunch', 'dinner').required().label('نوع وعده')
    .messages({ ...messages, 'any.only': 'نوع وعده باید یکی از breakfast، lunch یا dinner باشد' }),
  items: Joi.array().items(menuItemSchema).min(1).required().label('آیتم‌های منو').messages(messages),
  orderDeadline: Joi.date().required().label('مهلت سفارش').messages(messages),
  isActive: Joi.boolean().optional().label('وضعیت فعال').messages(messages)
});

const updateScheduleSchema = Joi.object({
  date: Joi.date().optional().label('تاریخ').messages(messages),
  mealType: Joi.string().valid('breakfast', 'lunch', 'dinner').optional().label('نوع وعده')
    .messages({ ...messages, 'any.only': 'نوع وعده باید یکی از breakfast، lunch یا dinner باشد' }),
  items: Joi.array().items(menuItemSchema).min(1).optional().label('آیتم‌های منو').messages(messages),
  orderDeadline: Joi.date().optional().label('مهلت سفارش').messages(messages),
  isActive: Joi.boolean().optional().label('وضعیت فعال').messages(messages)
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
  validateCreateSchedule: validate(createScheduleSchema),
  validateUpdateSchedule: validate(updateScheduleSchema)
};
