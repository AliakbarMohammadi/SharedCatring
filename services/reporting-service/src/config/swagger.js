const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'سرویس گزارش‌گیری - API',
      version: '1.0.0',
      description: 'API سرویس گزارش‌گیری و داشبورد مدیریتی',
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
        DashboardMetrics: {
          type: 'object',
          properties: {
            todayOrders: { type: 'integer' },
            todayRevenue: { type: 'number' },
            activeUsers: { type: 'integer' },
            pendingOrders: { type: 'integer' }
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
