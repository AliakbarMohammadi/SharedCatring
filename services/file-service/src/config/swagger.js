const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'سرویس مدیریت فایل',
      version: '1.0.0',
      description: 'API مدیریت فایل‌ها و تصاویر سیستم کترینگ',
      contact: {
        name: 'تیم توسعه',
        email: 'dev@catering.ir'
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
          bearerFormat: 'JWT',
          description: 'توکن JWT از سرویس احراز هویت'
        }
      },
      schemas: {
        File: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            originalName: { type: 'string' },
            fileName: { type: 'string' },
            mimeType: { type: 'string' },
            size: { type: 'integer' },
            path: { type: 'string' },
            isPublic: { type: 'boolean' },
            hasThumbnail: { type: 'boolean' },
            uploadedBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'array', items: { type: 'string' } },
                timestamp: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'فایل‌ها', description: 'مدیریت فایل‌ها' },
      { name: 'تصاویر', description: 'مدیریت تصاویر و تامبنیل' }
    ]
  },
  apis: ['./src/api/routes/**/*.js']
};

module.exports = swaggerJsdoc(options);
