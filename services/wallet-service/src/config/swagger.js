const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'سرویس کیف پول - API',
      version: '1.0.0',
      description: 'API سرویس مدیریت کیف پول کاربران و شرکت‌ها',
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
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            personalBalance: { type: 'number' },
            companyBalance: { type: 'number' },
            companyId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            amount: { type: 'number' },
            balanceBefore: { type: 'number' },
            balanceAfter: { type: 'number' },
            description: { type: 'string' }
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
