require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3007,
  serviceName: process.env.SERVICE_NAME || 'invoice-service',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'catering_db',
    user: process.env.DB_USER || 'catering_user',
    password: process.env.DB_PASSWORD || 'catering_pass_123'
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://catering_user:rabbitmq_pass_123@localhost:5672'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'سیستم کترینگ <noreply@example.com>'
  },
  
  storage: {
    path: process.env.STORAGE_PATH || './storage/invoices',
    baseUrl: process.env.BASE_URL || 'http://localhost:3007'
  },
  
  tax: {
    defaultRate: parseFloat(process.env.DEFAULT_TAX_RATE) || 9
  },
  
  currency: {
    name: process.env.CURRENCY || 'تومان',
    code: process.env.CURRENCY_CODE || 'IRR'
  },
  
  services: {
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3006',
    company: process.env.COMPANY_SERVICE_URL || 'http://localhost:3004'
  }
};
