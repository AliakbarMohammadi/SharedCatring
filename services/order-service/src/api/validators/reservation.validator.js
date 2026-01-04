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

const reservationItemSchema = Joi.object({
  date: Joi.date().required().label('تاریخ'),
  mealType: Joi.string().valid('breakfast', 'lunch', 'dinner').required().label('نوع وعده')
    .messages({ ...messages, 'any.only': 'نوع وعده باید breakfast، lunch یا dinner باشد' }),
  foodId: Joi.string().min(1).max(50).required().label('شناسه غذا'),
  quantity: Joi.number().integer().min(1).optional().default(1).label('تعداد')
  // foodName and unitPrice will be fetched from Menu Service
});

const createReservationSchema = Joi.object({
  companyId: Joi.string().uuid().optional().allow(null).label('شناسه شرکت').messages(messages),
  weekStartDate: Joi.date().required().label('تاریخ شروع هفته').messages(messages),
  items: Joi.array().items(reservationItemSchema).min(1).required().label('آیتم‌های رزرو').messages(messages)
});

const updateReservationSchema = Joi.object({
  items: Joi.array().items(reservationItemSchema).min(1).required().label('آیتم‌های رزرو').messages(messages)
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
  validateCreateReservation: validate(createReservationSchema),
  validateUpdateReservation: validate(updateReservationSchema)
};
