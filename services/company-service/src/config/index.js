require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3004,
  serviceName: process.env.SERVICE_NAME || 'company-service',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'catering_db',
    user: process.env.DB_USER || 'catering_user',
    password: process.env.DB_PASSWORD || 'catering_pass_123',
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 }
  },
  rabbitmq: { url: process.env.RABBITMQ_URL || 'amqp://localhost:5672' },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },
  logging: { level: process.env.LOG_LEVEL || 'info' }
};
