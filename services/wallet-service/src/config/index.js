require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3009,
  serviceName: process.env.SERVICE_NAME || 'wallet-service',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'wallet_db',
    user: process.env.DB_USER || 'catering_user',
    password: process.env.DB_PASSWORD || 'catering_pass_123'
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  
  wallet: {
    minTopupAmount: parseInt(process.env.MIN_TOPUP_AMOUNT, 10) || 10000,
    maxTopupAmount: parseInt(process.env.MAX_TOPUP_AMOUNT, 10) || 50000000,
    lowBalanceThreshold: parseInt(process.env.LOW_BALANCE_THRESHOLD, 10) || 50000
  }
};
