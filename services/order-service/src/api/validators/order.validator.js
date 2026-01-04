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

const orderItemSchema = Joi.object({
  foodId: Joi.string().min(1).max(50).required().label('شناسه غذا'),
  quantity: Joi.number().integer().min(1).required().label('تعداد'),
  notes: Joi.string().max(500).optional().allow('').label('یادداشت'),
  // Optional fallback fields - used if Menu Service is unavailable
  foodName: Joi.string().max(255).optional().label('نام غذا'),
  unitPrice: Joi.number().min(0).optional().label('قیمت واحد')
});

const createOrderSchema = Joi.object({
  companyId: Joi.string().uuid().optional().allow(null).label('شناسه شرکت').messages(messages),
  employeeId: Joi.string().uuid().optional().allow(null).label('شناسه کارمند').messages(messages),
  orderType: Joi.string().valid('personal', 'corporate').optional().label('نوع سفارش')
    .messages({ ...messages, 'any.only': 'نوع سفارش باید personal یا corporate باشد' }),
  items: Joi.array().items(orderItemSchema).min(1).required().label('آیتم‌های سفارش').messages(messages),
  deliveryDate: Joi.date().required().label('تاریخ تحویل').messages(messages),
  deliveryTimeSlot: Joi.string().optional().label('بازه زمانی تحویل').messages(messages),
  deliveryAddress: Joi.object({
    title: Joi.string().optional(),
    address: Joi.string().required(),
    city: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional()
  }).optional().label('آدرس تحویل').messages(messages),
  deliveryNotes: Joi.string().max(500).optional().allow('').label('یادداشت تحویل').messages(messages),
  promoCode: Joi.string().max(50).optional().allow('').label('کد تخفیف').messages(messages),
  notes: Joi.string().max(1000).optional().allow('').label('یادداشت').messages(messages),
  fromCart: Joi.boolean().optional().label('از سبد خرید').messages(messages)
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'preparing', 'ready', 'delivered', 'completed', 'rejected').required()
    .label('وضعیت').messages({ ...messages, 'any.only': 'وضعیت نامعتبر است' }),
  notes: Joi.string().max(500).optional().allow('').label('یادداشت').messages(messages)
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(500).optional().allow('').label('دلیل لغو').messages(messages)
});

const bulkOrderSchema = Joi.object({
  companyId: Joi.string().uuid().required().label('شناسه شرکت').messages(messages),
  deliveryDate: Joi.date().required().label('تاریخ تحویل').messages(messages),
  orders: Joi.array().items(Joi.object({
    employeeId: Joi.string().uuid().required().label('شناسه کارمند'),
    items: Joi.array().items(orderItemSchema).min(1).required().label('آیتم‌ها')
  })).min(1).required().label('سفارشات').messages(messages)
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
  validateCreateOrder: validate(createOrderSchema),
  validateUpdateStatus: validate(updateStatusSchema),
  validateCancelOrder: validate(cancelOrderSchema),
  validateBulkOrder: validate(bulkOrderSchema)
};
