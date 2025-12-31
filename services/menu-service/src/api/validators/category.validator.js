const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'any.required': '{#label} الزامی است',
  'number.base': '{#label} باید عدد باشد',
  'number.min': '{#label} نمی‌تواند منفی باشد',
  'boolean.base': '{#label} باید true یا false باشد'
};

const createCategorySchema = Joi.object({
  name: Joi.string().max(100).required().label('نام دسته‌بندی').messages(messages),
  description: Joi.string().max(500).optional().allow('').label('توضیحات').messages(messages),
  image: Joi.string().uri().optional().allow('').label('تصویر').messages(messages),
  parentId: Joi.string().hex().length(24).optional().allow(null).label('دسته‌بندی والد').messages(messages),
  order: Joi.number().min(0).optional().label('ترتیب').messages(messages),
  isActive: Joi.boolean().optional().label('وضعیت فعال').messages(messages)
});

const updateCategorySchema = Joi.object({
  name: Joi.string().max(100).optional().label('نام دسته‌بندی').messages(messages),
  description: Joi.string().max(500).optional().allow('').label('توضیحات').messages(messages),
  image: Joi.string().uri().optional().allow('', null).label('تصویر').messages(messages),
  parentId: Joi.string().hex().length(24).optional().allow(null).label('دسته‌بندی والد').messages(messages),
  order: Joi.number().min(0).optional().label('ترتیب').messages(messages),
  isActive: Joi.boolean().optional().label('وضعیت فعال').messages(messages)
});

const updateOrderSchema = Joi.object({
  order: Joi.number().min(0).required().label('ترتیب').messages(messages)
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
  validateCreateCategory: validate(createCategorySchema),
  validateUpdateCategory: validate(updateCategorySchema),
  validateUpdateOrder: validate(updateOrderSchema)
};
