const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'سرویس اعلان‌ها - API',
      version: '1.0.0',
      description: 'API سرویس مدیریت اعلان‌ها، ایمیل و پیامک',
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
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['email', 'sms', 'push', 'in_app'] },
            category: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'sent', 'failed', 'read'] },
            readAt: { type: 'string', format: 'date-time' }
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
