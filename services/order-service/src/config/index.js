require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3006,
  serviceName: process.env.SERVICE_NAME || 'order-service',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'order_db',
    user: process.env.DB_USER || 'catering_user',
    password: process.env.DB_PASSWORD || 'catering_pass_123'
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  
  services: {
    menu: process.env.MENU_SERVICE_URL || 'http://localhost:3005',
    wallet: process.env.WALLET_SERVICE_URL || 'http://localhost:3009',
    company: process.env.COMPANY_SERVICE_URL || 'http://localhost:3004'
  }
};
