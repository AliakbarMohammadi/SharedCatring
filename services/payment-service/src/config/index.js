require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3008,
  serviceName: process.env.SERVICE_NAME || 'payment-service',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'payment_db',
    user: process.env.DB_USER || 'catering_user',
    password: process.env.DB_PASSWORD || 'catering_pass_123'
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  
  gateways: {
    default: process.env.DEFAULT_GATEWAY || 'zarinpal',
    zarinpal: {
      merchantId: process.env.ZARINPAL_MERCHANT_ID,
      sandbox: process.env.ZARINPAL_SANDBOX === 'true',
      callbackUrl: process.env.ZARINPAL_CALLBACK_URL
    },
    idpay: {
      apiKey: process.env.IDPAY_API_KEY,
      sandbox: process.env.IDPAY_SANDBOX === 'true',
      callbackUrl: process.env.IDPAY_CALLBACK_URL
    }
  }
};
