require('dotenv').config();

/**
 * Notification Service Configuration
 * تنظیمات سرویس اعلان‌ها - آماده تولید
 */
module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3010,
  serviceName: process.env.SERVICE_NAME || 'notification-service',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_db'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || ''
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
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'سیستم کترینگ <noreply@catering.ir>'
  },
  
  sms: {
    // Production: use real provider (kavenegar, melipayamak, ghasedak)
    // Development: use 'console' to log SMS instead of sending
    provider: process.env.SMS_PROVIDER || 'console',
    apiKey: process.env.SMS_API_KEY || '',
    sender: process.env.SMS_SENDER || '30001234',
    password: process.env.SMS_PASSWORD || '' // For melipayamak
  },
  
  // Feature flags for production
  features: {
    // Set to false in production to send real SMS
    mockSms: process.env.ENABLE_MOCK_SMS === 'true',
    // Set to false in production to send real emails
    mockEmail: process.env.ENABLE_MOCK_EMAIL === 'true'
  }
};
