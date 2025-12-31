require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3010,
  serviceName: process.env.SERVICE_NAME || 'notification-service',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_db'
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'سیستم کترینگ <noreply@catering.ir>'
  },
  
  sms: {
    provider: process.env.SMS_PROVIDER || 'mock',
    apiKey: process.env.SMS_API_KEY || '',
    sender: process.env.SMS_SENDER || '30001234'
  }
};
