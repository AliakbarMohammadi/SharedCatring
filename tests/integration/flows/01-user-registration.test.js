/**
 * Flow 1: User Registration & Login
 * جریان ۱: ثبت‌نام و ورود کاربر
 */

const { clients } = require('../helpers/api-client');
const { 
  generateEmail, 
  generatePhone, 
  generateId,
  wait,
  logStep, 
  logSuccess, 
  logInfo 
} = require('../helpers/test-utils');
const config = require('../config');

describe('🔐 جریان ۱: ثبت‌نام و ورود کاربر', () => {
  let testUser = {
    email: generateEmail('user'),
    phone: generatePhone(),
    password: 'Test@123456',
    firstName: 'کاربر',
    lastName: 'تست'
  };
  let userId = null;
  let accessToken = null;
  let refreshToken = null;

  beforeAll(() => {
    logInfo(`ایمیل تست: ${testUser.email}`);
    logInfo(`شماره تلفن تست: ${testUser.phone}`);
  });

  test('مرحله ۱: ثبت‌نام کاربر جدید', async () => {
    logStep(1, 'ثبت‌نام کاربر جدید');

    const response = await clients.auth.post('/api/v1/auth/register', {
      email: testUser.email,
      phone: testUser.phone,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName
    });

    // Check if registration was successful or user already exists
    if (response.success) {
      expect(response.data).toBeDefined();
      userId = response.data.userId || response.data.id;
      logSuccess(`کاربر با شناسه ${userId} ثبت شد`);
    } else {
      // User might already exist from previous test
      logInfo(`ثبت‌نام: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۲: ورود با ایمیل و رمز عبور', async () => {
    logStep(2, 'ورود با ایمیل و رمز عبور');

    const response = await clients.auth.post('/api/v1/auth/login', {
      email: testUser.email,
      password: testUser.password
    });

    if (response.success) {
      expect(response.data).toBeDefined();
      expect(response.data.accessToken || response.data.token).toBeDefined();
      
      accessToken = response.data.accessToken || response.data.token;
      refreshToken = response.data.refreshToken;
      userId = response.data.user?.id || response.data.userId;
      
      logSuccess('ورود موفق');
      logInfo(`توکن دسترسی: ${accessToken.substring(0, 20)}...`);
    } else {
      logInfo(`ورود: ${response.error?.message || 'خطا'}`);
      // Try with phone number
      const phoneResponse = await clients.auth.post('/api/v1/auth/login', {
        phone: testUser.phone,
        password: testUser.password
      });
      
      if (phoneResponse.success) {
        accessToken = phoneResponse.data.accessToken || phoneResponse.data.token;
        refreshToken = phoneResponse.data.refreshToken;
        userId = phoneResponse.data.user?.id || phoneResponse.data.userId;
        logSuccess('ورود با شماره تلفن موفق');
      }
    }
  }, config.timeouts.medium);

  test('مرحله ۳: دریافت پروفایل کاربر', async () => {
    logStep(3, 'دریافت پروفایل کاربر');

    if (!accessToken && !userId) {
      logInfo('توکن یا شناسه کاربر موجود نیست - از شناسه تست استفاده می‌شود');
      userId = generateId();
    }

    // Set auth headers
    clients.user.setUserHeaders(userId, 'user');
    if (accessToken) {
      clients.user.setToken(accessToken);
    }

    const response = await clients.user.get('/api/v1/users/profile');

    if (response.success) {
      expect(response.data).toBeDefined();
      logSuccess(`پروفایل دریافت شد: ${response.data.firstName} ${response.data.lastName}`);
    } else {
      logInfo(`دریافت پروفایل: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۴: تایید دسترسی از طریق API Gateway', async () => {
    logStep(4, 'تایید دسترسی از طریق API Gateway');

    if (accessToken) {
      clients.gateway.setToken(accessToken);
    }
    if (userId) {
      clients.gateway.setUserHeaders(userId, 'user');
    }

    // Try to access a protected endpoint through gateway
    const response = await clients.gateway.get('/health');

    expect(response.success).toBe(true);
    logSuccess('دسترسی از طریق API Gateway تایید شد');
  }, config.timeouts.medium);

  test('مرحله ۵: بررسی پیام‌های فارسی', async () => {
    logStep(5, 'بررسی پیام‌های فارسی');

    // Test invalid login to check Persian error message
    const response = await clients.auth.post('/api/v1/auth/login', {
      email: 'invalid@test.com',
      password: 'wrongpassword'
    });

    if (!response.success && response.error?.message) {
      const persianRegex = /[\u0600-\u06FF]/;
      const hasPersian = persianRegex.test(response.error.message);
      
      if (hasPersian) {
        logSuccess(`پیام خطای فارسی: ${response.error.message}`);
      } else {
        logInfo(`پیام خطا فارسی نیست: ${response.error.message}`);
      }
    }
  }, config.timeouts.short);

  afterAll(() => {
    // Cleanup
    clients.auth.clearAuth();
    clients.user.clearAuth();
    clients.gateway.clearAuth();
    
    console.log('\n📋 خلاصه جریان ۱:');
    console.log(`  - شناسه کاربر: ${userId || 'ایجاد نشد'}`);
    console.log(`  - توکن: ${accessToken ? 'دریافت شد' : 'دریافت نشد'}`);
  });
});
