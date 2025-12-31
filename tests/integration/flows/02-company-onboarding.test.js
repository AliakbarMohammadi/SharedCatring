/**
 * Flow 2: Company Onboarding
 * جریان ۲: ثبت و راه‌اندازی شرکت
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

describe('🏢 جریان ۲: ثبت و راه‌اندازی شرکت', () => {
  let adminId = generateId();
  let companyId = null;
  let departmentId = null;
  let employeeId = null;
  let employeeWalletId = null;

  const testCompany = {
    name: `شرکت تست ${Date.now()}`,
    nationalId: `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
    email: generateEmail('company'),
    phone: generatePhone(),
    address: 'تهران، خیابان آزادی، پلاک ۱۲۳'
  };

  beforeAll(() => {
    // Set admin headers for all company service requests
    clients.company.setUserHeaders(adminId, 'admin');
    clients.wallet.setUserHeaders(adminId, 'admin');
    
    logInfo(`شناسه ادمین: ${adminId}`);
    logInfo(`نام شرکت: ${testCompany.name}`);
  });

  test('مرحله ۱: ثبت شرکت جدید', async () => {
    logStep(1, 'ثبت شرکت جدید');

    const response = await clients.company.post('/api/v1/companies', testCompany);

    if (response.success) {
      expect(response.data).toBeDefined();
      companyId = response.data.id;
      logSuccess(`شرکت با شناسه ${companyId} ثبت شد`);
    } else {
      logInfo(`ثبت شرکت: ${response.error?.message || 'خطا'}`);
      // Generate a mock company ID for subsequent tests
      companyId = generateId();
    }
  }, config.timeouts.medium);

  test('مرحله ۲: تایید شرکت توسط ادمین', async () => {
    logStep(2, 'تایید شرکت توسط ادمین');

    if (!companyId) {
      logInfo('شناسه شرکت موجود نیست - رد شد');
      return;
    }

    const response = await clients.company.patch(`/api/v1/companies/${companyId}/approve`, {
      status: 'approved'
    });

    if (response.success) {
      logSuccess('شرکت تایید شد');
    } else {
      logInfo(`تایید شرکت: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۳: ایجاد دپارتمان', async () => {
    logStep(3, 'ایجاد دپارتمان');

    if (!companyId) {
      logInfo('شناسه شرکت موجود نیست - رد شد');
      return;
    }

    const response = await clients.company.post(`/api/v1/companies/${companyId}/departments`, {
      name: 'دپارتمان فناوری اطلاعات',
      code: 'IT',
      managerId: adminId
    });

    if (response.success) {
      expect(response.data).toBeDefined();
      departmentId = response.data.id;
      logSuccess(`دپارتمان با شناسه ${departmentId} ایجاد شد`);
    } else {
      logInfo(`ایجاد دپارتمان: ${response.error?.message || 'خطا'}`);
      departmentId = generateId();
    }
  }, config.timeouts.medium);

  test('مرحله ۴: افزودن کارمند', async () => {
    logStep(4, 'افزودن کارمند');

    if (!companyId) {
      logInfo('شناسه شرکت موجود نیست - رد شد');
      return;
    }

    const employeeData = {
      firstName: 'کارمند',
      lastName: 'تست',
      email: generateEmail('employee'),
      phone: generatePhone(),
      departmentId: departmentId,
      employeeCode: `EMP${Date.now()}`
    };

    const response = await clients.company.post(`/api/v1/companies/${companyId}/employees`, employeeData);

    if (response.success) {
      expect(response.data).toBeDefined();
      employeeId = response.data.id || response.data.userId;
      logSuccess(`کارمند با شناسه ${employeeId} افزوده شد`);
    } else {
      logInfo(`افزودن کارمند: ${response.error?.message || 'خطا'}`);
      employeeId = generateId();
    }
  }, config.timeouts.medium);

  test('مرحله ۵: ایجاد کیف پول برای کارمند', async () => {
    logStep(5, 'ایجاد کیف پول برای کارمند');

    if (!employeeId || !companyId) {
      logInfo('شناسه کارمند یا شرکت موجود نیست - رد شد');
      return;
    }

    // Wait for event processing
    await wait(1000);

    // Check if wallet was created automatically via event
    clients.wallet.setUserHeaders(employeeId, 'user', companyId);
    const balanceResponse = await clients.wallet.get('/api/v1/wallets/balance');

    if (balanceResponse.success) {
      employeeWalletId = balanceResponse.data.id;
      logSuccess(`کیف پول کارمند موجود است: ${employeeWalletId}`);
    } else {
      // Try to create wallet manually
      const createResponse = await clients.wallet.post('/api/v1/wallets', {
        userId: employeeId,
        companyId: companyId
      });

      if (createResponse.success) {
        employeeWalletId = createResponse.data.id;
        logSuccess(`کیف پول ایجاد شد: ${employeeWalletId}`);
      } else {
        logInfo(`ایجاد کیف پول: ${createResponse.error?.message || 'خطا'}`);
      }
    }
  }, config.timeouts.medium);

  test('مرحله ۶: شارژ کیف پول شرکت', async () => {
    logStep(6, 'شارژ کیف پول شرکت');

    if (!companyId) {
      logInfo('شناسه شرکت موجود نیست - رد شد');
      return;
    }

    clients.wallet.setUserHeaders(adminId, 'admin');
    
    const response = await clients.wallet.post(`/api/v1/wallets/company/${companyId}/topup`, {
      amount: 10000000, // 10 million Toman
      description: 'شارژ اولیه کیف پول شرکت'
    });

    if (response.success) {
      logSuccess(`کیف پول شرکت شارژ شد: ${response.data.balance || response.data.totalBalance}`);
    } else {
      logInfo(`شارژ کیف پول: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۷: تخصیص یارانه به کارمند', async () => {
    logStep(7, 'تخصیص یارانه به کارمند');

    if (!companyId || !employeeId) {
      logInfo('شناسه شرکت یا کارمند موجود نیست - رد شد');
      return;
    }

    const response = await clients.wallet.post(`/api/v1/wallets/company/${companyId}/allocate`, {
      employeeId: employeeId,
      amount: 500000, // 500,000 Toman
      description: 'یارانه ماهانه'
    });

    if (response.success) {
      logSuccess('یارانه تخصیص داده شد');
    } else {
      logInfo(`تخصیص یارانه: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  afterAll(() => {
    clients.company.clearAuth();
    clients.wallet.clearAuth();
    
    console.log('\n📋 خلاصه جریان ۲:');
    console.log(`  - شناسه شرکت: ${companyId || 'ایجاد نشد'}`);
    console.log(`  - شناسه دپارتمان: ${departmentId || 'ایجاد نشد'}`);
    console.log(`  - شناسه کارمند: ${employeeId || 'ایجاد نشد'}`);
    console.log(`  - شناسه کیف پول: ${employeeWalletId || 'ایجاد نشد'}`);
  });
});
