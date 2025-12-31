/**
 * Integration Test Configuration
 * تنظیمات تست‌های یکپارچگی
 */

module.exports = {
  // Base URLs for services
  services: {
    apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    identity: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3003',
    company: process.env.COMPANY_SERVICE_URL || 'http://localhost:3004',
    menu: process.env.MENU_SERVICE_URL || 'http://localhost:3005',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3006',
    invoice: process.env.INVOICE_SERVICE_URL || 'http://localhost:3007',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3008',
    wallet: process.env.WALLET_SERVICE_URL || 'http://localhost:3009',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3010',
    reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:3011',
    file: process.env.FILE_SERVICE_URL || 'http://localhost:3012'
  },

  // Test timeouts
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000
  },

  // Test data
  testData: {
    admin: {
      email: 'admin@catering.ir',
      password: 'Admin@123456',
      phone: '09121234567'
    },
    user: {
      email: 'test.user@example.com',
      password: 'Test@123456',
      phone: '09129876543',
      firstName: 'کاربر',
      lastName: 'تست'
    },
    company: {
      name: 'شرکت تست',
      nationalId: '12345678901',
      email: 'info@testcompany.ir',
      phone: '02112345678',
      address: 'تهران، خیابان آزادی'
    }
  }
};
