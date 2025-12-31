const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'سرویس سفارشات - API',
      version: '1.0.0',
      description: 'API سرویس مدیریت سفارشات، سبد خرید و رزرو هفتگی',
      contact: { name: 'تیم توسعه کترینگ' }
    },
    servers: [
      { url: `http://localhost:${config.port}`, description: 'سرور توسعه' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderNumber: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled', 'rejected'] },
            totalAmount: { type: 'number' },
            deliveryDate: { type: 'string', format: 'date' }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            foodId: { type: 'string', format: 'uuid' },
            foodName: { type: 'string' },
            quantity: { type: 'integer' },
            unitPrice: { type: 'number' }
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
