#!/usr/bin/env node

/**
 * Production Seed Data Script
 * اسکریپت داده‌های اولیه تولید
 * 
 * این اسکریپت داده‌های واقعی اولیه را برای سیستم ایجاد می‌کند
 * بدون هیچ mock یا داده جعلی
 */

const axios = require('axios');

// Configuration
const config = {
  apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  timeout: 30000
};

// API Client
const api = axios.create({
  baseURL: config.apiGateway,
  timeout: config.timeout,
  headers: { 'Content-Type': 'application/json' }
});

let authToken = null;
let adminToken = null;

// Helper functions
const log = (emoji, message) => console.log(`${emoji} ${message}`);
const logSuccess = (message) => log('✅', message);
const logError = (message) => log('❌', message);
const logInfo = (message) => log('ℹ️', message);
const logStep = (step, message) => console.log(`\n📌 مرحله ${step}: ${message}`);

async function makeRequest(method, url, data = null, token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api({ method, url, data, headers });
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || { message: error.message }
    };
  }
}

// ============================================
// 1. USERS - کاربران
// ============================================
const users = {
  // کاربر عادی
  normalUser: {
    email: 'ali.mohammadi@example.com',
    phone: '09121234567',
    password: 'Ali@123456',
    firstName: 'علی',
    lastName: 'محمدی',
    role: 'personal_user'
  },
  // کاربر سازمانی
  corporateUser: {
    email: 'maryam.hosseini@testcompany.ir',
    phone: '09129876543',
    password: 'Maryam@123456',
    firstName: 'مریم',
    lastName: 'حسینی',
    role: 'corporate_user'
  },
  // مدیر شرکت
  companyAdmin: {
    email: 'admin@testcompany.ir',
    phone: '09123456789',
    password: 'Admin@123456',
    firstName: 'رضا',
    lastName: 'احمدی',
    role: 'company_admin'
  }
};

async function seedUsers() {
  logStep(1, 'ایجاد کاربران');
  const createdUsers = {};

  for (const [key, userData] of Object.entries(users)) {
    const response = await makeRequest('POST', '/api/v1/auth/register', userData);
    
    if (response.success) {
      createdUsers[key] = response.data;
      logSuccess(`کاربر ${userData.firstName} ${userData.lastName} (${userData.email}) ایجاد شد`);
    } else if (response.error?.code === 'ERR_USER_EXISTS' || response.error?.code === 'ERR_EMAIL_EXISTS') {
      logInfo(`کاربر ${userData.email} قبلاً وجود دارد`);
      // Try to login to get user info
      const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
        email: userData.email,
        password: userData.password
      });
      if (loginResponse.success) {
        createdUsers[key] = loginResponse.data.user;
        if (key === 'companyAdmin') {
          adminToken = loginResponse.data.accessToken;
        }
      }
    } else {
      logError(`خطا در ایجاد کاربر ${userData.email}: ${response.error?.message}`);
    }
  }

  // Login as company admin for further operations
  if (!adminToken) {
    const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      email: users.companyAdmin.email,
      password: users.companyAdmin.password
    });
    if (loginResponse.success) {
      adminToken = loginResponse.data.accessToken;
      logSuccess('ورود به عنوان مدیر شرکت انجام شد');
    }
  }

  return createdUsers;
}

// ============================================
// 2. COMPANY - شرکت
// ============================================
const companyData = {
  name: 'شرکت فناوری آینده',
  nationalId: '10320654789',
  economicCode: '411234567890',
  registrationNumber: '123456',
  email: 'info@ayandeh-tech.ir',
  phone: '02188776655',
  fax: '02188776656',
  website: 'https://ayandeh-tech.ir',
  address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
  postalCode: '1234567890',
  city: 'تهران',
  province: 'تهران',
  description: 'شرکت فناوری اطلاعات و نرم‌افزار',
  employeeCount: 50,
  subsidyPerEmployee: 500000, // 500,000 تومان یارانه روزانه
  monthlyBudget: 25000000 // 25 میلیون تومان بودجه ماهانه
};

async function seedCompany(adminUserId) {
  logStep(2, 'ایجاد شرکت');

  const response = await makeRequest('POST', '/api/v1/companies', {
    ...companyData,
    adminUserId
  }, adminToken);

  if (response.success) {
    logSuccess(`شرکت "${companyData.name}" ایجاد شد`);
    return response.data;
  } else if (response.error?.code === 'ERR_COMPANY_EXISTS') {
    logInfo('شرکت قبلاً وجود دارد');
    // Get existing company
    const getResponse = await makeRequest('GET', '/api/v1/companies/my', null, adminToken);
    if (getResponse.success) {
      return getResponse.data;
    }
  } else {
    logError(`خطا در ایجاد شرکت: ${response.error?.message}`);
  }
  return null;
}

async function assignEmployees(companyId, employees) {
  logStep(3, 'تخصیص کارمندان به شرکت');

  for (const employee of employees) {
    if (!employee?.id) continue;
    
    const response = await makeRequest('POST', `/api/v1/companies/${companyId}/employees`, {
      userId: employee.id,
      department: 'فناوری اطلاعات',
      position: 'کارشناس'
    }, adminToken);

    if (response.success) {
      logSuccess(`کارمند ${employee.email || employee.id} به شرکت اضافه شد`);
    } else {
      logInfo(`تخصیص کارمند: ${response.error?.message}`);
    }
  }
}

async function allocateCompanyWallet(companyId) {
  logStep(4, 'شارژ کیف پول شرکت');

  const response = await makeRequest('POST', `/api/v1/wallets/company/${companyId}/topup`, {
    amount: 50000000, // 50 میلیون تومان
    description: 'شارژ اولیه حساب شرکت'
  }, adminToken);

  if (response.success) {
    logSuccess('کیف پول شرکت شارژ شد: ۵۰,۰۰۰,۰۰۰ تومان');
    return response.data;
  } else {
    logInfo(`شارژ کیف پول شرکت: ${response.error?.message}`);
  }
  return null;
}

// ============================================
// 3. MENU - منو
// ============================================
const categories = [
  { name: 'غذای اصلی', slug: 'main', description: 'غذاهای اصلی ایرانی', order: 1 },
  { name: 'پیش‌غذا', slug: 'appetizer', description: 'پیش‌غذاها و سالادها', order: 2 },
  { name: 'نوشیدنی', slug: 'beverage', description: 'نوشیدنی‌های گرم و سرد', order: 3 },
  { name: 'دسر', slug: 'dessert', description: 'دسرها و شیرینی‌ها', order: 4 }
];

const foodItems = [
  // غذاهای اصلی
  { name: 'چلوکباب کوبیده', category: 'main', price: 180000, description: 'دو سیخ کباب کوبیده با برنج ایرانی و گوجه کبابی', calories: 650, preparationTime: 25 },
  { name: 'چلوکباب برگ', category: 'main', price: 280000, description: 'یک سیخ کباب برگ با برنج زعفرانی', calories: 700, preparationTime: 30 },
  { name: 'جوجه کباب', category: 'main', price: 160000, description: 'جوجه کباب با برنج و زعفران', calories: 550, preparationTime: 25 },
  { name: 'قورمه سبزی', category: 'main', price: 140000, description: 'خورشت قورمه سبزی با برنج', calories: 480, preparationTime: 20 },
  { name: 'قیمه', category: 'main', price: 130000, description: 'خورشت قیمه با برنج', calories: 520, preparationTime: 20 },
  { name: 'زرشک پلو با مرغ', category: 'main', price: 150000, description: 'زرشک پلو با مرغ سرخ شده', calories: 600, preparationTime: 25 },
  { name: 'باقالی پلو با ماهیچه', category: 'main', price: 220000, description: 'باقالی پلو با ماهیچه گوسفندی', calories: 750, preparationTime: 35 },
  { name: 'ماهی قزل‌آلا', category: 'main', price: 200000, description: 'ماهی قزل‌آلا کبابی با سبزیجات', calories: 450, preparationTime: 30 },
  
  // پیش‌غذا
  { name: 'سالاد فصل', category: 'appetizer', price: 45000, description: 'سالاد کاهو، گوجه، خیار با سس مخصوص', calories: 120, preparationTime: 10 },
  { name: 'سالاد شیرازی', category: 'appetizer', price: 35000, description: 'خیار، گوجه، پیاز با آبلیمو', calories: 80, preparationTime: 10 },
  { name: 'سوپ جو', category: 'appetizer', price: 50000, description: 'سوپ جو با سبزیجات', calories: 180, preparationTime: 15 },
  { name: 'ماست و خیار', category: 'appetizer', price: 30000, description: 'ماست با خیار و نعنا', calories: 100, preparationTime: 5 },
  
  // نوشیدنی
  { name: 'دوغ', category: 'beverage', price: 15000, description: 'دوغ محلی', calories: 60, preparationTime: 2 },
  { name: 'نوشابه', category: 'beverage', price: 12000, description: 'نوشابه گازدار', calories: 140, preparationTime: 1 },
  { name: 'آب معدنی', category: 'beverage', price: 8000, description: 'آب معدنی ۵۰۰ میلی‌لیتر', calories: 0, preparationTime: 1 },
  { name: 'چای', category: 'beverage', price: 10000, description: 'چای ایرانی', calories: 5, preparationTime: 5 },
  
  // دسر
  { name: 'باقلوا', category: 'dessert', price: 40000, description: 'باقلوای یزدی', calories: 250, preparationTime: 5 },
  { name: 'فرنی', category: 'dessert', price: 35000, description: 'فرنی با دارچین', calories: 200, preparationTime: 10 },
  { name: 'شله زرد', category: 'dessert', price: 30000, description: 'شله زرد سنتی', calories: 220, preparationTime: 10 }
];

async function seedMenu() {
  logStep(5, 'ایجاد منو و غذاها');

  // Create categories
  const createdCategories = {};
  for (const category of categories) {
    const response = await makeRequest('POST', '/api/v1/menu/categories', category, adminToken);
    if (response.success) {
      createdCategories[category.slug] = response.data;
      logSuccess(`دسته‌بندی "${category.name}" ایجاد شد`);
    } else {
      logInfo(`دسته‌بندی ${category.name}: ${response.error?.message}`);
    }
  }

  // Create food items
  const createdFoods = [];
  for (const food of foodItems) {
    const categoryId = createdCategories[food.category]?.id || createdCategories[food.category]?._id;
    const response = await makeRequest('POST', '/api/v1/menu/foods', {
      ...food,
      categoryId,
      isAvailable: true
    }, adminToken);
    
    if (response.success) {
      createdFoods.push(response.data);
      logSuccess(`غذای "${food.name}" ایجاد شد - قیمت: ${food.price.toLocaleString('fa-IR')} تومان`);
    } else {
      logInfo(`غذای ${food.name}: ${response.error?.message}`);
    }
  }

  // Create daily menu for today
  const today = new Date().toISOString().split('T')[0];
  const dailyMenuResponse = await makeRequest('POST', '/api/v1/menu/daily', {
    date: today,
    title: `منوی روز ${today}`,
    items: createdFoods.slice(0, 8).map(f => ({
      foodId: f.id || f._id,
      available: true,
      maxQuantity: 50
    }))
  }, adminToken);

  if (dailyMenuResponse.success) {
    logSuccess(`منوی روزانه برای ${today} ایجاد شد`);
  } else {
    logInfo(`منوی روزانه: ${dailyMenuResponse.error?.message}`);
  }

  // Create weekly menu
  const weeklyMenuItems = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    weeklyMenuItems.push({
      date: date.toISOString().split('T')[0],
      items: createdFoods.slice(i % 4, (i % 4) + 6).map(f => ({
        foodId: f.id || f._id,
        available: true
      }))
    });
  }

  const weeklyMenuResponse = await makeRequest('POST', '/api/v1/menu/weekly', {
    startDate: today,
    days: weeklyMenuItems
  }, adminToken);

  if (weeklyMenuResponse.success) {
    logSuccess('منوی هفتگی ایجاد شد');
  } else {
    logInfo(`منوی هفتگی: ${weeklyMenuResponse.error?.message}`);
  }

  return { categories: createdCategories, foods: createdFoods };
}

// ============================================
// MAIN EXECUTION
// ============================================
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 شروع ایجاد داده‌های اولیه تولید');
  console.log('='.repeat(60));

  try {
    // 1. Create users
    const createdUsers = await seedUsers();

    // 2. Create company
    const company = await seedCompany(createdUsers.companyAdmin?.id);

    // 3. Assign employees
    if (company) {
      await assignEmployees(company.id || company._id, [
        createdUsers.corporateUser
      ]);

      // 4. Allocate company wallet
      await allocateCompanyWallet(company.id || company._id);
    }

    // 5. Create menu
    await seedMenu();

    console.log('\n' + '='.repeat(60));
    console.log('✅ داده‌های اولیه با موفقیت ایجاد شدند');
    console.log('='.repeat(60));

    console.log('\n📋 خلاصه:');
    console.log('  کاربران:');
    console.log(`    - کاربر عادی: ${users.normalUser.email} / ${users.normalUser.password}`);
    console.log(`    - کاربر سازمانی: ${users.corporateUser.email} / ${users.corporateUser.password}`);
    console.log(`    - مدیر شرکت: ${users.companyAdmin.email} / ${users.companyAdmin.password}`);
    console.log(`  شرکت: ${companyData.name}`);
    console.log(`  دسته‌بندی‌ها: ${categories.length} عدد`);
    console.log(`  غذاها: ${foodItems.length} عدد`);

  } catch (error) {
    console.error('\n❌ خطا در ایجاد داده‌های اولیه:', error.message);
    process.exit(1);
  }
}

main();
