const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'سرویس منو - API',
      version: '1.0.0',
      description: 'API سرویس مدیریت منو، غذاها، دسته‌بندی‌ها و برنامه‌ریزی روزانه',
      contact: {
        name: 'تیم توسعه کترینگ'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'سرور توسعه'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'شناسه دسته‌بندی' },
            name: { type: 'string', description: 'نام دسته‌بندی' },
            slug: { type: 'string', description: 'نامک' },
            description: { type: 'string', description: 'توضیحات' },
            image: { type: 'string', description: 'تصویر' },
            parentId: { type: 'string', description: 'شناسه دسته‌بندی والد' },
            order: { type: 'number', description: 'ترتیب نمایش' },
            isActive: { type: 'boolean', description: 'وضعیت فعال' }
          }
        },
        FoodItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'شناسه غذا' },
            name: { type: 'string', description: 'نام غذا' },
            slug: { type: 'string', description: 'نامک' },
            description: { type: 'string', description: 'توضیحات' },
            categoryId: { type: 'string', description: 'شناسه دسته‌بندی' },
            images: { type: 'array', items: { type: 'string' }, description: 'تصاویر' },
            pricing: {
              type: 'object',
              properties: {
                basePrice: { type: 'number', description: 'قیمت پایه' },
                discountedPrice: { type: 'number', description: 'قیمت تخفیف‌دار' }
              }
            },
            isAvailable: { type: 'boolean', description: 'موجودی' }
          }
        },
        MenuSchedule: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'شناسه برنامه' },
            date: { type: 'string', format: 'date', description: 'تاریخ' },
            mealType: { type: 'string', enum: ['breakfast', 'lunch', 'dinner'], description: 'نوع وعده' },
            items: { type: 'array', description: 'آیتم‌های منو' },
            orderDeadline: { type: 'string', format: 'date-time', description: 'مهلت سفارش' },
            isActive: { type: 'boolean', description: 'وضعیت فعال' }
          }
        },
        Promotion: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'شناسه تخفیف' },
            code: { type: 'string', description: 'کد تخفیف' },
            name: { type: 'string', description: 'نام تخفیف' },
            type: { type: 'string', enum: ['percentage', 'fixed'], description: 'نوع تخفیف' },
            value: { type: 'number', description: 'مقدار تخفیف' },
            isActive: { type: 'boolean', description: 'وضعیت فعال' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/api/routes/**/*.js']
};

module.exports = swaggerJsdoc(options);
