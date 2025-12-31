const Joi = require('joi');

const messages = {
  'string.empty': '{#label} نمی‌تواند خالی باشد',
  'string.max': '{#label} نباید بیشتر از {#limit} کاراکتر باشد',
  'any.required': '{#label} الزامی است',
  'number.base': '{#label} باید عدد باشد',
  'number.min': '{#label} نمی‌تواند منفی باشد',
  'number.max': '{#label} نمی‌تواند بیشتر از {#limit} باشد',
  'boolean.base': '{#label} باید true یا false باشد',
  'array.base': '{#label} باید آرایه باشد'
};

const nutritionSchema = Joi.object({
  calories: Joi.number().min(0).optional(),
  protein: Joi.number().min(0).optional(),
  carbohydrates: Joi.number().min(0).optional(),
  fat: Joi.number().min(0).optional(),
  fiber: Joi.number().min(0).optional()
});

const attributesSchema = Joi.object({
  isVegetarian: Joi.boolean().optional(),
  isVegan: Joi.boolean().optional(),
  isGlutenFree: Joi.boolean().optional(),
  isSpicy: Joi.boolean().optional(),
  spicyLevel: Joi.number().min(0).max(5).optional(),
  servingSize: Joi.string().max(50).optional(),
  preparationTime: Joi.number().min(0).optional()
});

const pricingSchema = Joi.object({
  basePrice: Joi.number().min(0).required().label('قیمت پایه'),
  discountedPrice: Joi.number().min(0).optional().allow(null).label('قیمت تخفیف‌دار')
});

const corporatePriceSchema = Joi.object({
  companyId: Joi.string().required().label('شناسه شرکت'),
  price: Joi.number().min(0).required().label('قیمت'),
  discountPercentage: Joi.number().min(0).max(100).optional().label('درصد تخفیف')
});

const createFoodItemSchema = Joi.object({
  name: Joi.string().max(200).required().label('نام غذا').messages(messages),
  description: Joi.string().max(1000).optional().allow('').label('توضیحات').messages(messages),
  categoryId: Joi.string().hex().length(24).required().label('دسته‌بندی').messages(messages),
  images: Joi.array().items(Joi.string().uri()).optional().label('تصاویر').messages(messages),
  thumbnailImage: Joi.string().uri().optional().allow('').label('تصویر کوچک').messages(messages),
  pricing: pricingSchema.required().label('قیمت‌گذاری').messages(messages),
  nutrition: nutritionSchema.optional().label('اطلاعات تغذیه‌ای'),
  attributes: attributesSchema.optional().label('ویژگی‌ها'),
  allergens: Joi.array().items(Joi.string().max(50)).optional().label('آلرژن‌ها').messages(messages),
  ingredients: Joi.array().items(Joi.string().max(100)).optional().label('مواد تشکیل‌دهنده').messages(messages),
  tags: Joi.array().items(Joi.string().max(30)).optional().label('برچسب‌ها').messages(messages),
  isAvailable: Joi.boolean().optional().label('موجودی').messages(messages),
  isFeatured: Joi.boolean().optional().label('ویژه').messages(messages),
  sortOrder: Joi.number().min(0).optional().label('ترتیب').messages(messages)
});

const updateFoodItemSchema = Joi.object({
  name: Joi.string().max(200).optional().label('نام غذا').messages(messages),
  description: Joi.string().max(1000).optional().allow('').label('توضیحات').messages(messages),
  categoryId: Joi.string().hex().length(24).optional().label('دسته‌بندی').messages(messages),
  images: Joi.array().items(Joi.string().uri()).optional().label('تصاویر').messages(messages),
  thumbnailImage: Joi.string().uri().optional().allow('', null).label('تصویر کوچک').messages(messages),
  pricing: pricingSchema.optional().label('قیمت‌گذاری').messages(messages),
  nutrition: nutritionSchema.optional().label('اطلاعات تغذیه‌ای'),
  attributes: attributesSchema.optional().label('ویژگی‌ها'),
  allergens: Joi.array().items(Joi.string().max(50)).optional().label('آلرژن‌ها').messages(messages),
  ingredients: Joi.array().items(Joi.string().max(100)).optional().label('مواد تشکیل‌دهنده').messages(messages),
  tags: Joi.array().items(Joi.string().max(30)).optional().label('برچسب‌ها').messages(messages),
  isAvailable: Joi.boolean().optional().label('موجودی').messages(messages),
  isFeatured: Joi.boolean().optional().label('ویژه').messages(messages),
  sortOrder: Joi.number().min(0).optional().label('ترتیب').messages(messages)
});

const updateAvailabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required().label('موجودی').messages(messages)
});

const updatePricesSchema = Joi.object({
  basePrice: Joi.number().min(0).optional().label('قیمت پایه').messages(messages),
  discountedPrice: Joi.number().min(0).optional().allow(null).label('قیمت تخفیف‌دار').messages(messages)
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
  validateCreateFoodItem: validate(createFoodItemSchema),
  validateUpdateFoodItem: validate(updateFoodItemSchema),
  validateUpdateAvailability: validate(updateAvailabilitySchema),
  validateUpdatePrices: validate(updatePricesSchema),
  validateCorporatePrice: validate(corporatePriceSchema)
};
