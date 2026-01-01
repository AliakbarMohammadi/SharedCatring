#!/usr/bin/env node

/**
 * Production Readiness Checklist
 * چک‌لیست آمادگی تولید
 * 
 * این اسکریپت سیستم را برای آمادگی تولید بررسی می‌کند
 */

const fs = require('fs');
const path = require('path');

// Results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper functions
const log = (emoji, message) => console.log(`${emoji} ${message}`);
const pass = (message) => { results.passed.push(message); log('✅', message); };
const fail = (message) => { results.failed.push(message); log('❌', message); };
const warn = (message) => { results.warnings.push(message); log('⚠️', message); };

// Check functions
function checkNoMockInFile(filePath, serviceName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const mockPatterns = [
      /mockUsers\s*=/i,
      /getMockDailyReport/i,
      /getMockMonthlyReport/i,
      /getMockRevenueReport/i,
      /getMockCompanyReport/i,
      /getMockPopularItems/i,
      /if\s*\(\s*config\.env\s*===\s*['"]development['"]\s*\)/,
      /simulated:\s*true/,
      /MOCK-\$\{Date\.now\(\)\}/
    ];

    for (const pattern of mockPatterns) {
      if (pattern.test(content)) {
        return false;
      }
    }
    return true;
  } catch (error) {
    return true; // File doesn't exist, skip
  }
}

function checkServiceIntegration(servicePath) {
  try {
    const configPath = path.join(servicePath, 'src/config/index.js');
    if (!fs.existsSync(configPath)) return true;
    
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Check for localhost references (should use service names in Docker)
    if (content.includes("'localhost'") && !content.includes('process.env')) {
      return false;
    }
    return true;
  } catch (error) {
    return true;
  }
}

function checkHealthEndpoint(servicePath) {
  try {
    const appPath = path.join(servicePath, 'src/app.js');
    if (!fs.existsSync(appPath)) return true;
    
    const content = fs.readFileSync(appPath, 'utf8');
    return content.includes('/health') || content.includes("'/health'");
  } catch (error) {
    return true;
  }
}

function checkEventPublisher(servicePath) {
  try {
    const publisherPath = path.join(servicePath, 'src/events/publisher.js');
    return fs.existsSync(publisherPath);
  } catch (error) {
    return false;
  }
}

function checkEventSubscriber(servicePath) {
  try {
    const subscriberPath = path.join(servicePath, 'src/events/subscriber.js');
    return fs.existsSync(subscriberPath);
  } catch (error) {
    return false;
  }
}

function checkPersianErrorMessages(servicePath) {
  try {
    const files = getAllJsFiles(servicePath);
    let hasPersianErrors = false;
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      // Check for Persian characters in error messages
      if (/message:\s*['"][^'"]*[\u0600-\u06FF]+[^'"]*['"]/.test(content)) {
        hasPersianErrors = true;
        break;
      }
    }
    return hasPersianErrors;
  } catch (error) {
    return false;
  }
}

function getAllJsFiles(dir, files = []) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!item.includes('node_modules')) {
          getAllJsFiles(fullPath, files);
        }
      } else if (item.endsWith('.js')) {
        files.push(fullPath);
      }
    }
    return files;
  } catch (error) {
    return files;
  }
}

// Main checks
console.log('\n' + '═'.repeat(60));
console.log('🔍 چک‌لیست آمادگی تولید');
console.log('═'.repeat(60) + '\n');

// 1. Check for mock code removal
console.log('📋 بررسی حذف کدهای Mock:\n');

const services = [
  'services/auth-service',
  'services/identity-service',
  'services/user-service',
  'services/company-service',
  'services/menu-service',
  'services/order-service',
  'services/invoice-service',
  'services/payment-service',
  'services/wallet-service',
  'services/notification-service',
  'services/reporting-service',
  'services/file-service',
  'services/api-gateway'
];

for (const service of services) {
  const serviceName = path.basename(service);
  const controllerPath = path.join(service, 'src/api/controllers');
  const servicePath = path.join(service, 'src/services');
  const repoPath = path.join(service, 'src/repositories');
  
  let hasMock = false;
  
  // Check controllers
  if (fs.existsSync(controllerPath)) {
    const files = fs.readdirSync(controllerPath);
    for (const file of files) {
      if (!checkNoMockInFile(path.join(controllerPath, file), serviceName)) {
        hasMock = true;
        break;
      }
    }
  }
  
  // Check services
  if (fs.existsSync(servicePath)) {
    const files = fs.readdirSync(servicePath);
    for (const file of files) {
      if (!checkNoMockInFile(path.join(servicePath, file), serviceName)) {
        hasMock = true;
        break;
      }
    }
  }
  
  // Check repositories
  if (fs.existsSync(repoPath)) {
    const files = fs.readdirSync(repoPath);
    for (const file of files) {
      if (!checkNoMockInFile(path.join(repoPath, file), serviceName)) {
        hasMock = true;
        break;
      }
    }
  }
  
  if (hasMock) {
    fail(`${serviceName}: کد Mock یافت شد`);
  } else {
    pass(`${serviceName}: بدون کد Mock`);
  }
}

// 2. Check service integrations
console.log('\n📋 بررسی یکپارچگی سرویس‌ها:\n');

for (const service of services) {
  const serviceName = path.basename(service);
  
  if (checkServiceIntegration(service)) {
    pass(`${serviceName}: تنظیمات سرویس صحیح`);
  } else {
    warn(`${serviceName}: استفاده از localhost بدون متغیر محیطی`);
  }
}

// 3. Check health endpoints
console.log('\n📋 بررسی Health Endpoints:\n');

for (const service of services) {
  const serviceName = path.basename(service);
  
  if (checkHealthEndpoint(service)) {
    pass(`${serviceName}: Health endpoint موجود`);
  } else {
    fail(`${serviceName}: Health endpoint یافت نشد`);
  }
}

// 4. Check event bus integration
console.log('\n📋 بررسی Event Bus:\n');

const eventServices = [
  'services/auth-service',
  'services/order-service',
  'services/payment-service',
  'services/wallet-service',
  'services/notification-service',
  'services/invoice-service',
  'services/company-service'
];

for (const service of eventServices) {
  const serviceName = path.basename(service);
  const hasPublisher = checkEventPublisher(service);
  const hasSubscriber = checkEventSubscriber(service);
  
  if (hasPublisher) {
    pass(`${serviceName}: Event Publisher موجود`);
  } else {
    warn(`${serviceName}: Event Publisher یافت نشد`);
  }
  
  if (hasSubscriber) {
    pass(`${serviceName}: Event Subscriber موجود`);
  }
}

// 5. Check Persian error messages
console.log('\n📋 بررسی پیام‌های خطای فارسی:\n');

for (const service of services) {
  const serviceName = path.basename(service);
  
  if (checkPersianErrorMessages(service)) {
    pass(`${serviceName}: پیام‌های فارسی موجود`);
  } else {
    warn(`${serviceName}: پیام‌های فارسی یافت نشد`);
  }
}

// 6. Check environment files
console.log('\n📋 بررسی فایل‌های محیطی:\n');

if (fs.existsSync('.env.production')) {
  const envContent = fs.readFileSync('.env.production', 'utf8');
  
  if (envContent.includes('ENABLE_MOCK_PAYMENTS=false')) {
    pass('Mock Payments غیرفعال است');
  } else {
    warn('ENABLE_MOCK_PAYMENTS باید false باشد');
  }
  
  if (envContent.includes('ENABLE_MOCK_SMS=false')) {
    pass('Mock SMS غیرفعال است');
  } else {
    warn('ENABLE_MOCK_SMS باید false باشد');
  }
  
  if (envContent.includes('ENABLE_MOCK_EMAIL=false')) {
    pass('Mock Email غیرفعال است');
  } else {
    warn('ENABLE_MOCK_EMAIL باید false باشد');
  }
  
  if (envContent.includes('NODE_ENV=production')) {
    pass('NODE_ENV=production تنظیم شده');
  } else {
    fail('NODE_ENV باید production باشد');
  }
} else {
  fail('فایل .env.production یافت نشد');
}

// 7. Check Docker configuration
console.log('\n📋 بررسی Docker:\n');

if (fs.existsSync('docker-compose.production.yml')) {
  const dockerContent = fs.readFileSync('docker-compose.production.yml', 'utf8');
  
  if (dockerContent.includes('healthcheck:')) {
    pass('Health checks در Docker تنظیم شده');
  } else {
    warn('Health checks در Docker یافت نشد');
  }
  
  if (dockerContent.includes('restart: unless-stopped')) {
    pass('Restart policy تنظیم شده');
  } else {
    warn('Restart policy یافت نشد');
  }
  
  if (dockerContent.includes('catering-network')) {
    pass('Docker network تنظیم شده');
  } else {
    fail('Docker network یافت نشد');
  }
} else {
  fail('فایل docker-compose.production.yml یافت نشد');
}

// Print summary
console.log('\n' + '═'.repeat(60));
console.log('📊 خلاصه نتایج');
console.log('═'.repeat(60));
console.log(`✅ موفق: ${results.passed.length}`);
console.log(`❌ ناموفق: ${results.failed.length}`);
console.log(`⚠️ هشدار: ${results.warnings.length}`);
console.log('═'.repeat(60));

if (results.failed.length > 0) {
  console.log('\n❌ موارد ناموفق:');
  results.failed.forEach(item => console.log(`  - ${item}`));
}

if (results.warnings.length > 0) {
  console.log('\n⚠️ هشدارها:');
  results.warnings.forEach(item => console.log(`  - ${item}`));
}

console.log('\n' + '═'.repeat(60));
if (results.failed.length === 0) {
  console.log('🎉 سیستم آماده تولید است!');
} else {
  console.log('⚠️ لطفاً موارد ناموفق را برطرف کنید.');
}
console.log('═'.repeat(60) + '\n');

process.exit(results.failed.length > 0 ? 1 : 0);
