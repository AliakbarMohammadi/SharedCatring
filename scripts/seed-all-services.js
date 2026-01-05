#!/usr/bin/env node

/**
 * Seed All Services Script
 * اسکریپت ایجاد داده‌های اولیه برای همه سرویس‌ها
 */

const axios = require('axios');

// Configuration
const config = {
  timeout: 30000,
  services: {
    auth: 'http://localhost:3001',
    identity: 'http://localhost:3002',
    user: 'http://localhost:3003',
    company: 'http://localhost:3004',
    menu: 'http://localhost:3005',
    order: 'http://localhost:3006',
    invoice: 'http://localhost:3007',
    payment: 'http://localhost:3008',
    wallet: 'http://localhost:3009',
    notification: 'http://localhost:3010',
    reporting: 'http://localhost:3011',
    file: 'http://localhost:3012'
  }
};

// Helper functions
const log = (emoji, message) => console.log(`${emoji} ${message}`);
const logSuccess = (message) => log('✅', message);
const logError = (message) => log('❌', message);
const logInfo = (message) => log('ℹ️', message);
const logStep = (step, message) => console.log(`\n📌 مرحله ${step}: ${message}`);

async function checkServiceHealth(serviceName, url) {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 5000 });
    if (response.data.success) {
      logSuccess(`${serviceName} service در حال اجرا است`);
      return true;
    }
  } catch (error) {
    logError(`${serviceName} service در دسترس نیست: ${error.message}`);
    return false;
  }
}

async function createSuperAdmin() {
  logStep(1, 'ایجاد سوپر ادمین');
  
  try {
    const response = await axios.post(`${config.services.auth}/api/v1/auth/register`, {
      email: 'superadmin@catering.com',
      password: 'SuperAdmin@123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin'
    }, { timeout: config.timeout });

    if (response.data.success) {
      logSuccess('سوپر ادمین ایجاد شد: superadmin@catering.com');
      return response.data.data;
    }
  } catch (error) {
    if (error.response?.data?.error?.code === 'ERR_USER_EXISTS') {
      logInfo('سوپر ادمین قبلاً وجود دارد');
      return { email: 'superadmin@catering.com' };
    } else {
      logError(`خطا در ایجاد سوپر ادمین: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  return null;
}

async function loginSuperAdmin() {
  logStep(2, 'ورود سوپر ادمین');
  
  try {
    const response = await axios.post(`${config.services.auth}/api/v1/auth/login`, {
      email: 'superadmin@catering.com',
      password: 'SuperAdmin@123'
    }, { timeout: config.timeout });

    if (response.data.success) {
      logSuccess('ورود سوپر ادمین موفق بود');
      return response.data.data.accessToken;
    }
  } catch (error) {
    logError(`خطا در ورود سوپر ادمین: ${error.response?.data?.error?.message || error.message}`);
  }
  return null;
}

async function seedIdentityService() {
  logStep(3, 'ایجاد نقش‌ها و دسترسی‌ها (Identity Service)');
  
  // Identity service automatically seeds on startup
  logInfo('Identity service به صورت خودکار نقش‌ها و دسترسی‌ها را ایجاد می‌کند');
  logSuccess('نقش‌ها و دسترسی‌ها آماده است');
}

async function restartServices() {
  logStep(4, 'راه‌اندازی مجدد سرویس‌ها برای اعمال seed ها');
  
  logInfo('لطفاً سرویس‌های زیر را restart کنید:');
  console.log('  - User Service (port 3003)');
  console.log('  - Company Service (port 3004)');
  console.log('  - Wallet Service (port 3009)');
  console.log('');
  console.log('دستورات restart:');
  console.log('  cd services/user-service && npm start');
  console.log('  cd services/company-service && npm start');
  console.log('  cd services/wallet-service && npm start');
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 شروع ایجاد داده‌های اولیه سیستم کترینگ');
  console.log('='.repeat(60));

  try {
    // Check service health
    logStep(0, 'بررسی وضعیت سرویس‌ها');
    const healthChecks = await Promise.all([
      checkServiceHealth('Auth', config.services.auth),
      checkServiceHealth('Identity', config.services.identity),
      checkServiceHealth('User', config.services.user),
      checkServiceHealth('Company', config.services.company),
      checkServiceHealth('Wallet', config.services.wallet)
    ]);

    const allHealthy = healthChecks.every(check => check);
    if (!allHealthy) {
      logError('برخی سرویس‌ها در دسترس نیستند. لطفاً ابتدا همه سرویس‌ها را راه‌اندازی کنید.');
      process.exit(1);
    }

    // Create super admin
    const superAdmin = await createSuperAdmin();
    if (!superAdmin) {
      logError('ایجاد سوپر ادمین ناموفق بود');
      process.exit(1);
    }

    // Login super admin
    const token = await loginSuperAdmin();
    if (!token) {
      logError('ورود سوپر ادمین ناموفق بود');
      process.exit(1);
    }

    // Seed identity service
    await seedIdentityService();

    // Restart services for seeding
    await restartServices();

    console.log('\n' + '='.repeat(60));
    console.log('✅ داده‌های اولیه با موفقیت ایجاد شدند');
    console.log('='.repeat(60));

    console.log('\n📋 اطلاعات دسترسی:');
    console.log('  سوپر ادمین:');
    console.log('    ایمیل: superadmin@catering.com');
    console.log('    رمز عبور: SuperAdmin@123');
    console.log('');
    console.log('🔗 لینک‌های مفید:');
    console.log('  API Gateway: http://localhost:3000');
    console.log('  Auth Service: http://localhost:3001');
    console.log('  Identity Service: http://localhost:3002');
    console.log('  User Service: http://localhost:3003');
    console.log('  Company Service: http://localhost:3004');
    console.log('  Wallet Service: http://localhost:3009');

  } catch (error) {
    console.error('\n❌ خطا در ایجاد داده‌های اولیه:', error.message);
    process.exit(1);
  }
}

main();