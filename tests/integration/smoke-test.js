#!/usr/bin/env node

/**
 * Smoke Test Script
 * تست دود - بررسی سریع سلامت سیستم
 */

const axios = require('axios');

const services = [
  { name: 'API Gateway', url: 'http://localhost:3000/health' },
  { name: 'Auth Service', url: 'http://localhost:3001/health' },
  { name: 'Identity Service', url: 'http://localhost:3002/health' },
  { name: 'User Service', url: 'http://localhost:3003/health' },
  { name: 'Company Service', url: 'http://localhost:3004/health' },
  { name: 'Menu Service', url: 'http://localhost:3005/health' },
  { name: 'Order Service', url: 'http://localhost:3006/health' },
  { name: 'Invoice Service', url: 'http://localhost:3007/health' },
  { name: 'Payment Service', url: 'http://localhost:3008/health' },
  { name: 'Wallet Service', url: 'http://localhost:3009/health' },
  { name: 'Notification Service', url: 'http://localhost:3010/health' },
  { name: 'Reporting Service', url: 'http://localhost:3011/health' },
  { name: 'File Service', url: 'http://localhost:3012/health' }
];

async function checkService(service) {
  try {
    const response = await axios.get(service.url, { timeout: 5000 });
    if (response.data.success) {
      return { ...service, status: 'healthy', message: response.data.message };
    }
    return { ...service, status: 'unhealthy', message: 'پاسخ نامعتبر' };
  } catch (error) {
    return { 
      ...service, 
      status: 'down', 
      message: error.code === 'ECONNREFUSED' ? 'سرویس در دسترس نیست' : error.message 
    };
  }
}

async function runSmokeTest() {
  console.log('\n🔥 تست دود - سیستم کترینگ سازمانی');
  console.log('='.repeat(50));
  console.log(`⏰ زمان: ${new Date().toLocaleString('fa-IR')}`);
  console.log('='.repeat(50));

  const results = await Promise.all(services.map(checkService));

  let healthy = 0;
  let unhealthy = 0;
  let down = 0;

  console.log('\n📊 نتایج:\n');

  results.forEach(result => {
    let icon;
    switch (result.status) {
      case 'healthy':
        icon = '✅';
        healthy++;
        break;
      case 'unhealthy':
        icon = '⚠️';
        unhealthy++;
        break;
      default:
        icon = '❌';
        down++;
    }
    console.log(`${icon} ${result.name.padEnd(25)} ${result.status.padEnd(12)} ${result.message || ''}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log('📈 خلاصه:');
  console.log(`   ✅ سالم: ${healthy}`);
  console.log(`   ⚠️ ناسالم: ${unhealthy}`);
  console.log(`   ❌ خاموش: ${down}`);
  console.log('='.repeat(50));

  if (down > 0 || unhealthy > 0) {
    console.log('\n⚠️ برخی سرویس‌ها مشکل دارند!');
    process.exit(1);
  } else {
    console.log('\n✅ همه سرویس‌ها سالم هستند!');
    process.exit(0);
  }
}

runSmokeTest().catch(error => {
  console.error('❌ خطا در اجرای تست:', error.message);
  process.exit(1);
});
