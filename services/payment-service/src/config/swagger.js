const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'سرویس پرداخت - API',
      version: '1.0.0',
      description: 'API سرویس مدیریت پرداخت‌ها و اتصال به درگاه‌های بانکی',
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
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderId: { type: 'string', format: 'uuid' },
            invoiceId: { type: 'string', format: 'uuid' },
            amount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed', 'refunded'] },
            gateway: { type: 'string' },
            trackingCode: { type: 'string' }
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
