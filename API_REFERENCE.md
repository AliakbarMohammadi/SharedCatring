# API Reference - Catering Microservices System

> **Base URL:** `http://localhost:3000`  
> **Version:** v1  
> **Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#1-authentication-service)
2. [Identity Management](#2-identity-service)
3. [User Profile](#3-user-service)
4. [Company (B2B)](#4-company-service)
5. [Menu](#5-menu-service)
6. [Orders](#6-order-service)
7. [Wallet](#7-wallet-service)
8. [Payments](#8-payment-service)
9. [Invoices](#9-invoice-service)
10. [Notifications](#10-notification-service)
11. [Reports](#11-reporting-service)
12. [Files](#12-file-service)

---

## Authentication Headers

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 1. Authentication Service

Base Path: `/api/v1/auth`

### 1.1 Register User

**`POST`** `http://localhost:3000/api/v1/auth/register`

**Description:** ثبت‌نام کاربر جدید

**Authorization:** 🔓 Public

#### 📥 Request Example

```json
{
  "email": "user@example.com",
  "password": "SecurePass@123",
  "firstName": "علی",
  "lastName": "محمدی",
  "phone": "09121234567",
  "role": "personal_user"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | ایمیل کاربر |
| password | string | ✅ | رمز عبور (حداقل 8 کاراکتر) |
| firstName | string | ✅ | نام |
| lastName | string | ✅ | نام خانوادگی |
| phone | string | ❌ | شماره موبایل |
| role | string | ❌ | نقش: `personal_user`, `company_admin`, `company_employee`, `super_admin` |

#### 📤 Response Example (201)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "علی",
      "lastName": "محمدی",
      "role": "personal_user",
      "status": "pending"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  },
  "message": "ثبت‌نام با موفقیت انجام شد"
}
```

---

### 1.2 Login

**`POST`** `http://localhost:3000/api/v1/auth/login`

**Description:** ورود به سیستم

**Authorization:** 🔓 Public

#### 📥 Request Example

```json
{
  "email": "user@example.com",
  "password": "SecurePass@123"
}
```

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "علی",
      "lastName": "محمدی",
      "role": "personal_user",
      "status": "active"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  },
  "message": "ورود موفقیت‌آمیز"
}
```

---

### 1.3 Refresh Token

**`POST`** `http://localhost:3000/api/v1/auth/refresh-token`

**Description:** تمدید توکن دسترسی

**Authorization:** 🔓 Public

#### 📥 Request Example

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

---

### 1.4 Logout

**`POST`** `http://localhost:3000/api/v1/auth/logout`

**Description:** خروج از سیستم

**Authorization:** 🔒 Required (`Bearer <Token>`)

#### 📤 Response Example (200)

```json
{
  "success": true,
  "message": "خروج موفقیت‌آمیز"
}
```

---

### 1.5 Logout All Devices

**`POST`** `http://localhost:3000/api/v1/auth/logout-all`

**Description:** خروج از همه دستگاه‌ها

**Authorization:** 🔒 Required

---

### 1.6 Forgot Password

**`POST`** `http://localhost:3000/api/v1/auth/forgot-password`

**Description:** درخواست بازیابی رمز عبور

**Authorization:** 🔓 Public

#### 📥 Request Example

```json
{
  "email": "user@example.com"
}
```

---

### 1.7 Reset Password

**`POST`** `http://localhost:3000/api/v1/auth/reset-password`

**Description:** تنظیم رمز عبور جدید

**Authorization:** 🔓 Public

#### 📥 Request Example

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass@123"
}
```

---

### 1.8 Verify Token

**`POST`** `http://localhost:3000/api/v1/auth/verify-token`

**Description:** اعتبارسنجی توکن

**Authorization:** 🔓 Public

#### 📥 Request Example

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 1.9 Get Active Sessions

**`GET`** `http://localhost:3000/api/v1/auth/sessions`

**Description:** دریافت لیست نشست‌های فعال

**Authorization:** 🔒 Required

---

## 2. Identity Service

Base Path: `/api/v1/identity`

> **Note:** All endpoints require authentication

### 2.1 Create User

**`POST`** `http://localhost:3000/api/v1/identity/users`

**Description:** ایجاد کاربر جدید (ادمین)

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "email": "newuser@example.com",
  "firstName": "مریم",
  "lastName": "احمدی",
  "role": "company_employee",
  "companyId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 2.2 Get All Users

**`GET`** `http://localhost:3000/api/v1/identity/users`

**Description:** دریافت لیست کاربران

**Authorization:** 🔒 Required (Admin)

| Query Param | Type | Description |
|-------------|------|-------------|
| page | number | شماره صفحه |
| limit | number | تعداد در صفحه |
| role | string | فیلتر بر اساس نقش |
| status | string | فیلتر بر اساس وضعیت |

---

### 2.3 Get User by ID

**`GET`** `http://localhost:3000/api/v1/identity/users/:id`

**Description:** دریافت اطلاعات کاربر

**Authorization:** 🔒 Required

---

### 2.4 Get User by Email

**`GET`** `http://localhost:3000/api/v1/identity/users/by-email/:email`

**Description:** دریافت کاربر با ایمیل (Internal)

**Authorization:** 🔒 Required

---

### 2.5 Update User

**`PUT`** `http://localhost:3000/api/v1/identity/users/:id`

**Description:** ویرایش اطلاعات کاربر

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "firstName": "علی",
  "lastName": "رضایی",
  "phone": "09121234567"
}
```

---

### 2.6 Update User Status

**`PATCH`** `http://localhost:3000/api/v1/identity/users/:id/status`

**Description:** تغییر وضعیت کاربر (فعال/غیرفعال)

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "status": "active"
}
```

| Status Values |
|---------------|
| `pending` |
| `active` |
| `suspended` |
| `inactive` |

---

### 2.7 Assign Role

**`POST`** `http://localhost:3000/api/v1/identity/users/:id/assign-role`

**Description:** تخصیص نقش به کاربر

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "role": "company_admin",
  "companyId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 2.8 Update Password

**`PATCH`** `http://localhost:3000/api/v1/identity/users/:id/password`

**Description:** تغییر رمز عبور

**Authorization:** 🔒 Required

---

### 2.9 Delete User

**`DELETE`** `http://localhost:3000/api/v1/identity/users/:id`

**Description:** حذف کاربر

**Authorization:** 🔒 Required (Admin)

---

## 3. User Service

Base Path: `/api/v1/users`

> **Note:** All endpoints require authentication

### 3.1 Get User Stats

**`GET`** `http://localhost:3000/api/v1/users/stats`

**Description:** آمار کاربران (ادمین)

**Authorization:** 🔒 Required (Admin)

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 980,
    "newUsersThisMonth": 45,
    "byRole": {
      "personal_user": 800,
      "company_employee": 400,
      "company_admin": 50
    }
  }
}
```

---

### 3.2 Get All Users

**`GET`** `http://localhost:3000/api/v1/users`

**Description:** لیست کاربران

**Authorization:** 🔒 Required (Admin)

---

### 3.3 Get Users by Company

**`GET`** `http://localhost:3000/api/v1/users/company/:companyId`

**Description:** کاربران یک شرکت

**Authorization:** 🔒 Required (Company Admin)

---

### 3.4 Get User by ID

**`GET`** `http://localhost:3000/api/v1/users/:id`

**Description:** دریافت پروفایل کاربر

**Authorization:** 🔒 Required

---

### 3.5 Create User

**`POST`** `http://localhost:3000/api/v1/users`

**Description:** ایجاد کاربر

**Authorization:** 🔒 Required (Admin)

---

### 3.6 Update User

**`PUT`** `http://localhost:3000/api/v1/users/:id`

**Description:** ویرایش کاربر

**Authorization:** 🔒 Required

---

### 3.7 Update User Status

**`PATCH`** `http://localhost:3000/api/v1/users/:id/status`

**Description:** تغییر وضعیت کاربر

**Authorization:** 🔒 Required (Admin)

---

### 3.8 Update User Preferences

**`PATCH`** `http://localhost:3000/api/v1/users/:id/preferences`

**Description:** ویرایش تنظیمات کاربر

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "language": "fa",
  "notifications": {
    "email": true,
    "sms": false
  },
  "dietaryRestrictions": ["vegetarian"]
}
```

---

### 3.9 Assign User to Company

**`POST`** `http://localhost:3000/api/v1/users/:id/assign-company`

**Description:** اختصاص کاربر به شرکت

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "departmentId": "660e8400-e29b-41d4-a716-446655440000"
}
```

---

### 3.10 Delete User

**`DELETE`** `http://localhost:3000/api/v1/users/:id`

**Description:** حذف کاربر

**Authorization:** 🔒 Required (Admin)

---

## 4. Company Service

Base Path: `/api/v1/companies`

> **Note:** All endpoints require authentication

### 4.1 Get Company Stats

**`GET`** `http://localhost:3000/api/v1/companies/stats`

**Description:** آمار شرکت‌ها (ادمین)

**Authorization:** 🔒 Required (Admin)

---

### 4.2 Create Company

**`POST`** `http://localhost:3000/api/v1/companies`

**Description:** ایجاد شرکت جدید

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "name": "شرکت نمونه",
  "nationalId": "12345678901",
  "economicCode": "411123456789",
  "address": "تهران، خیابان ولیعصر",
  "phone": "02112345678",
  "email": "info@company.ir",
  "adminUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 4.3 Get All Companies

**`GET`** `http://localhost:3000/api/v1/companies`

**Description:** لیست شرکت‌ها

**Authorization:** 🔒 Required (Admin)

---

### 4.4 Get Company by ID

**`GET`** `http://localhost:3000/api/v1/companies/:id`

**Description:** دریافت اطلاعات شرکت

**Authorization:** 🔒 Required

---

### 4.5 Update Company

**`PUT`** `http://localhost:3000/api/v1/companies/:id`

**Description:** ویرایش شرکت

**Authorization:** 🔒 Required (Company Admin)

---

### 4.6 Update Company Status

**`PATCH`** `http://localhost:3000/api/v1/companies/:id/status`

**Description:** تغییر وضعیت شرکت

**Authorization:** 🔒 Required (Admin)

---

### 4.7 Get Company Dashboard

**`GET`** `http://localhost:3000/api/v1/companies/:id/dashboard`

**Description:** داشبورد شرکت

**Authorization:** 🔒 Required (Company Admin)

---

### Departments

### 4.8 Create Department

**`POST`** `http://localhost:3000/api/v1/companies/:id/departments`

**Description:** ایجاد دپارتمان

**Authorization:** 🔒 Required (Company Admin)

#### 📥 Request Example

```json
{
  "name": "فناوری اطلاعات",
  "code": "IT",
  "managerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 4.9 Get Company Departments

**`GET`** `http://localhost:3000/api/v1/companies/:id/departments`

**Description:** لیست دپارتمان‌های شرکت

**Authorization:** 🔒 Required

---

### 4.10 Update Department

**`PUT`** `http://localhost:3000/api/v1/companies/:id/departments/:deptId`

**Description:** ویرایش دپارتمان

**Authorization:** 🔒 Required (Company Admin)

---

### 4.11 Delete Department

**`DELETE`** `http://localhost:3000/api/v1/companies/:id/departments/:deptId`

**Description:** حذف دپارتمان

**Authorization:** 🔒 Required (Company Admin)

---

### Employees

### 4.12 Add Employee

**`POST`** `http://localhost:3000/api/v1/companies/:id/employees`

**Description:** افزودن کارمند

**Authorization:** 🔒 Required (Company Admin)

#### 📥 Request Example

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "employeeCode": "EMP001",
  "departmentId": "660e8400-e29b-41d4-a716-446655440000",
  "shiftId": "770e8400-e29b-41d4-a716-446655440000",
  "position": "توسعه‌دهنده"
}
```

---

### 4.13 Bulk Add Employees

**`POST`** `http://localhost:3000/api/v1/companies/:id/employees/bulk`

**Description:** افزودن دسته‌ای کارمندان

**Authorization:** 🔒 Required (Company Admin)

---

### 4.14 Get Company Employees

**`GET`** `http://localhost:3000/api/v1/companies/:id/employees`

**Description:** لیست کارمندان شرکت

**Authorization:** 🔒 Required (Company Admin)

---

### 4.15 Export Employees

**`GET`** `http://localhost:3000/api/v1/companies/:id/employees/export`

**Description:** خروجی Excel کارمندان

**Authorization:** 🔒 Required (Company Admin)

---

### 4.16 Get Employee by ID

**`GET`** `http://localhost:3000/api/v1/companies/:id/employees/:empId`

**Description:** دریافت اطلاعات کارمند

**Authorization:** 🔒 Required

---

### 4.17 Update Employee

**`PUT`** `http://localhost:3000/api/v1/companies/:id/employees/:empId`

**Description:** ویرایش کارمند

**Authorization:** 🔒 Required (Company Admin)

---

### 4.18 Delete Employee

**`DELETE`** `http://localhost:3000/api/v1/companies/:id/employees/:empId`

**Description:** حذف کارمند

**Authorization:** 🔒 Required (Company Admin)

---

### Shifts

### 4.19 Create Shift

**`POST`** `http://localhost:3000/api/v1/companies/:id/shifts`

**Description:** ایجاد شیفت کاری

**Authorization:** 🔒 Required (Company Admin)

#### 📥 Request Example

```json
{
  "name": "شیفت صبح",
  "startTime": "08:00",
  "endTime": "16:00",
  "mealTypes": ["lunch"]
}
```

---

### 4.20 Get Company Shifts

**`GET`** `http://localhost:3000/api/v1/companies/:id/shifts`

**Description:** لیست شیفت‌های شرکت

**Authorization:** 🔒 Required

---

### 4.21 Update Shift

**`PUT`** `http://localhost:3000/api/v1/companies/:id/shifts/:shiftId`

**Description:** ویرایش شیفت

**Authorization:** 🔒 Required (Company Admin)

---

### Subsidy Rules

### 4.22 Create Subsidy Rule

**`POST`** `http://localhost:3000/api/v1/companies/:id/subsidy-rules`

**Description:** ایجاد قانون یارانه

**Authorization:** 🔒 Required (Company Admin)

#### 📥 Request Example

```json
{
  "name": "یارانه ناهار",
  "type": "percentage",
  "value": 50,
  "maxAmount": 100000,
  "mealTypes": ["lunch"],
  "isActive": true
}
```

---

### 4.23 Get Subsidy Rules

**`GET`** `http://localhost:3000/api/v1/companies/:id/subsidy-rules`

**Description:** لیست قوانین یارانه

**Authorization:** 🔒 Required

---

### 4.24 Update Subsidy Rule

**`PUT`** `http://localhost:3000/api/v1/companies/:id/subsidy-rules/:ruleId`

**Description:** ویرایش قانون یارانه

**Authorization:** 🔒 Required (Company Admin)

---

### 4.25 Calculate Subsidy

**`POST`** `http://localhost:3000/api/v1/companies/:id/subsidy/calculate`

**Description:** محاسبه یارانه (Internal)

**Authorization:** 🔒 Required

---

### 4.26 Get Employee Info

**`GET`** `http://localhost:3000/api/v1/companies/:id/employee-info`

**Description:** اطلاعات کارمند برای یارانه

**Authorization:** 🔒 Required

---

## 5. Menu Service

Base Path: `/api/v1/menus`

### Categories

### 5.1 Get All Categories

**`GET`** `http://localhost:3000/api/v1/menus/categories`

**Description:** لیست دسته‌بندی‌ها

**Authorization:** 🔓 Public

| Query Param | Type | Description |
|-------------|------|-------------|
| includeInactive | boolean | شامل غیرفعال‌ها |
| parentId | string | فیلتر والد |

---

### 5.2 Get Category Tree

**`GET`** `http://localhost:3000/api/v1/menus/categories/tree`

**Description:** درخت دسته‌بندی‌ها

**Authorization:** 🔓 Public

---

### 5.3 Get Category by ID

**`GET`** `http://localhost:3000/api/v1/menus/categories/:id`

**Description:** دریافت دسته‌بندی

**Authorization:** 🔓 Public

---

### 5.4 Create Category

**`POST`** `http://localhost:3000/api/v1/menus/categories`

**Description:** ایجاد دسته‌بندی

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "name": "غذاهای ایرانی",
  "description": "انواع غذاهای سنتی ایرانی",
  "image": "https://example.com/image.jpg",
  "parentId": null,
  "order": 1
}
```

---

### 5.5 Update Category

**`PUT`** `http://localhost:3000/api/v1/menus/categories/:id`

**Description:** ویرایش دسته‌بندی

**Authorization:** 🔒 Required (Admin)

---

### 5.6 Delete Category

**`DELETE`** `http://localhost:3000/api/v1/menus/categories/:id`

**Description:** حذف دسته‌بندی

**Authorization:** 🔒 Required (Admin)

---

### 5.7 Update Category Order

**`PATCH`** `http://localhost:3000/api/v1/menus/categories/:id/order`

**Description:** تغییر ترتیب دسته‌بندی

**Authorization:** 🔒 Required (Admin)

---

### Food Items

### 5.8 Get All Food Items

**`GET`** `http://localhost:3000/api/v1/menus/items`

**Description:** لیست غذاها

**Authorization:** 🔓 Public

| Query Param | Type | Description |
|-------------|------|-------------|
| page | number | شماره صفحه |
| limit | number | تعداد در صفحه |
| categoryId | string | فیلتر دسته‌بندی |
| isAvailable | boolean | فیلتر موجودی |
| search | string | جستجو |
| minPrice | number | حداقل قیمت |
| maxPrice | number | حداکثر قیمت |

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "چلوکباب کوبیده",
        "description": "دو سیخ کباب کوبیده با برنج ایرانی",
        "categoryId": "660e8400-e29b-41d4-a716-446655440000",
        "pricing": {
          "basePrice": 150000
        },
        "isAvailable": true,
        "image": "https://example.com/kabab.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

---

### 5.9 Get Popular Items

**`GET`** `http://localhost:3000/api/v1/menus/items/popular`

**Description:** غذاهای محبوب

**Authorization:** 🔓 Public

---

### 5.10 Get Featured Items

**`GET`** `http://localhost:3000/api/v1/menus/items/featured`

**Description:** غذاهای ویژه

**Authorization:** 🔓 Public

---

### 5.11 Get Food Item by ID

**`GET`** `http://localhost:3000/api/v1/menus/items/:id`

**Description:** دریافت غذا

**Authorization:** 🔓 Public

---

### 5.12 Get Food Nutrition

**`GET`** `http://localhost:3000/api/v1/menus/items/:id/nutrition`

**Description:** اطلاعات تغذیه‌ای

**Authorization:** 🔓 Public

---

### 5.13 Get Food Prices

**`GET`** `http://localhost:3000/api/v1/menus/items/:id/prices`

**Description:** قیمت‌های غذا

**Authorization:** 🔓 Public

---

### 5.14 Create Food Item

**`POST`** `http://localhost:3000/api/v1/menus/items`

**Description:** ایجاد غذا

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "name": "چلوکباب کوبیده",
  "description": "دو سیخ کباب کوبیده با برنج ایرانی",
  "categoryId": "660e8400-e29b-41d4-a716-446655440000",
  "pricing": {
    "basePrice": 150000
  },
  "nutrition": {
    "calories": 650,
    "protein": 35,
    "carbs": 60,
    "fat": 25
  },
  "preparationTime": 30,
  "isAvailable": true
}
```

---

### 5.15 Update Food Item

**`PUT`** `http://localhost:3000/api/v1/menus/items/:id`

**Description:** ویرایش غذا

**Authorization:** 🔒 Required (Admin)

---

### 5.16 Delete Food Item

**`DELETE`** `http://localhost:3000/api/v1/menus/items/:id`

**Description:** حذف غذا

**Authorization:** 🔒 Required (Admin)

---

### 5.17 Update Food Availability

**`PATCH`** `http://localhost:3000/api/v1/menus/items/:id/availability`

**Description:** تغییر موجودی غذا

**Authorization:** 🔒 Required (Kitchen)

#### 📥 Request Example

```json
{
  "isAvailable": false
}
```

---

### 5.18 Update Food Prices

**`PUT`** `http://localhost:3000/api/v1/menus/items/:id/prices`

**Description:** ویرایش قیمت‌ها

**Authorization:** 🔒 Required (Admin)

---

### 5.19 Add Corporate Price

**`POST`** `http://localhost:3000/api/v1/menus/items/:id/prices/corporate`

**Description:** افزودن قیمت سازمانی

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "price": 120000,
  "discountPercentage": 20
}
```

---

### Menu Schedule

### 5.20 Get Today's Menu

**`GET`** `http://localhost:3000/api/v1/menus/daily`

**Description:** منوی امروز

**Authorization:** 🔓 Public

| Query Param | Type | Description |
|-------------|------|-------------|
| mealType | string | `breakfast`, `lunch`, `dinner` |

---

### 5.21 Get Weekly Menu

**`GET`** `http://localhost:3000/api/v1/menus/weekly`

**Description:** منوی هفتگی

**Authorization:** 🔓 Public

---

### 5.22 Get Menu by Date

**`GET`** `http://localhost:3000/api/v1/menus/date/:date`

**Description:** منوی تاریخ خاص

**Authorization:** 🔓 Public

---

### 5.23 Get Schedule by ID

**`GET`** `http://localhost:3000/api/v1/menus/schedule/:id`

**Description:** دریافت برنامه غذایی

**Authorization:** 🔓 Public

---

### 5.24 Create Menu Schedule

**`POST`** `http://localhost:3000/api/v1/menus/schedule`

**Description:** ایجاد برنامه غذایی

**Authorization:** 🔒 Required (Kitchen)

#### 📥 Request Example

```json
{
  "date": "2024-01-15",
  "mealType": "lunch",
  "items": [
    {
      "foodId": "550e8400-e29b-41d4-a716-446655440000",
      "maxQuantity": 100
    }
  ],
  "orderDeadline": "2024-01-15T10:00:00Z"
}
```

---

### 5.25 Update Menu Schedule

**`PUT`** `http://localhost:3000/api/v1/menus/schedule/:id`

**Description:** ویرایش برنامه غذایی

**Authorization:** 🔒 Required (Kitchen)

---

### 5.26 Delete Menu Schedule

**`DELETE`** `http://localhost:3000/api/v1/menus/schedule/:id`

**Description:** حذف برنامه غذایی

**Authorization:** 🔒 Required (Admin)

---

### Promotions

### 5.27 Get All Promotions

**`GET`** `http://localhost:3000/api/v1/menus/promotions`

**Description:** لیست تخفیف‌ها

**Authorization:** 🔒 Required (Admin)

---

### 5.28 Get Promotion by ID

**`GET`** `http://localhost:3000/api/v1/menus/promotions/:id`

**Description:** دریافت تخفیف

**Authorization:** 🔒 Required (Admin)

---

### 5.29 Create Promotion

**`POST`** `http://localhost:3000/api/v1/menus/promotions`

**Description:** ایجاد تخفیف

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "code": "NEWYEAR20",
  "name": "تخفیف سال نو",
  "type": "percentage",
  "value": 20,
  "startDate": "2024-03-20",
  "endDate": "2024-03-25",
  "minOrderAmount": 100000,
  "maxUsage": 1000
}
```

---

### 5.30 Validate Promotion Code

**`POST`** `http://localhost:3000/api/v1/menus/promotions/validate`

**Description:** اعتبارسنجی کد تخفیف

**Authorization:** 🔓 Public

#### 📥 Request Example

```json
{
  "code": "NEWYEAR20",
  "orderAmount": 500000
}
```

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": 100000,
    "finalAmount": 400000
  }
}
```

---

### 5.31 Update Promotion

**`PUT`** `http://localhost:3000/api/v1/menus/promotions/:id`

**Description:** ویرایش تخفیف

**Authorization:** 🔒 Required (Admin)

---

### 5.32 Delete Promotion

**`DELETE`** `http://localhost:3000/api/v1/menus/promotions/:id`

**Description:** حذف تخفیف

**Authorization:** 🔒 Required (Admin)

---

## 6. Order Service

Base Path: `/api/v1/orders`

### Cart

### 6.1 Get Cart

**`GET`** `http://localhost:3000/api/v1/orders/cart`

**Description:** دریافت سبد خرید

**Authorization:** 🔒 Required

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "items": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "foodId": "770e8400-e29b-41d4-a716-446655440000",
        "foodName": "چلوکباب کوبیده",
        "quantity": 2,
        "unitPrice": 150000,
        "totalPrice": 300000
      }
    ],
    "totalAmount": 300000
  }
}
```

---

### 6.2 Add Item to Cart

**`POST`** `http://localhost:3000/api/v1/orders/cart/items`

**Description:** افزودن آیتم به سبد خرید

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "foodId": "550e8400-e29b-41d4-a716-446655440000",
  "foodName": "چلوکباب کوبیده",
  "quantity": 2,
  "unitPrice": 150000,
  "notes": "بدون پیاز"
}
```

---

### 6.3 Update Cart Item

**`PUT`** `http://localhost:3000/api/v1/orders/cart/items/:id`

**Description:** ویرایش آیتم سبد خرید

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "quantity": 3,
  "notes": "با سس تند"
}
```

---

### 6.4 Remove Cart Item

**`DELETE`** `http://localhost:3000/api/v1/orders/cart/items/:id`

**Description:** حذف آیتم از سبد خرید

**Authorization:** 🔒 Required

---

### 6.5 Clear Cart

**`DELETE`** `http://localhost:3000/api/v1/orders/cart`

**Description:** خالی کردن سبد خرید

**Authorization:** 🔒 Required

---

### Orders

### 6.6 Get Order Stats

**`GET`** `http://localhost:3000/api/v1/orders/stats`

**Description:** آمار سفارشات (ادمین)

**Authorization:** 🔒 Required (Admin)

---

### 6.7 Create Order

**`POST`** `http://localhost:3000/api/v1/orders`

**Description:** ثبت سفارش جدید

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "orderType": "personal",
  "items": [
    {
      "foodId": "550e8400-e29b-41d4-a716-446655440000",
      "foodName": "چلوکباب کوبیده",
      "quantity": 2,
      "unitPrice": 150000
    }
  ],
  "deliveryDate": "2024-01-15",
  "deliveryAddress": {
    "address": "تهران، خیابان ولیعصر",
    "floor": "3",
    "unit": "5"
  },
  "promoCode": "NEWYEAR20"
}
```

#### 📤 Response Example (201)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-1403-0001",
    "status": "pending",
    "items": [...],
    "subtotal": 300000,
    "discount": 60000,
    "total": 240000,
    "deliveryDate": "2024-01-15"
  },
  "message": "سفارش با موفقیت ثبت شد"
}
```

---

### 6.8 Get User Orders

**`GET`** `http://localhost:3000/api/v1/orders`

**Description:** لیست سفارشات کاربر

**Authorization:** 🔒 Required

| Query Param | Type | Description |
|-------------|------|-------------|
| page | number | شماره صفحه |
| limit | number | تعداد در صفحه |
| status | string | فیلتر وضعیت |
| orderType | string | `personal`, `corporate` |

---

### 6.9 Create Bulk Order

**`POST`** `http://localhost:3000/api/v1/orders/bulk`

**Description:** ثبت سفارش گروهی

**Authorization:** 🔒 Required (Company Admin)

---

### 6.10 Get Order by ID

**`GET`** `http://localhost:3000/api/v1/orders/:id`

**Description:** دریافت جزئیات سفارش

**Authorization:** 🔒 Required

---

### 6.11 Update Order Status

**`PATCH`** `http://localhost:3000/api/v1/orders/:id/status`

**Description:** تغییر وضعیت سفارش

**Authorization:** 🔒 Required (Kitchen)

#### 📥 Request Example

```json
{
  "status": "preparing",
  "notes": "در حال آماده‌سازی"
}
```

| Status Values |
|---------------|
| `confirmed` |
| `preparing` |
| `ready` |
| `delivered` |
| `completed` |
| `rejected` |

---

### 6.12 Cancel Order

**`POST`** `http://localhost:3000/api/v1/orders/:id/cancel`

**Description:** لغو سفارش

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "reason": "تغییر برنامه"
}
```

---

### 6.13 Reorder

**`POST`** `http://localhost:3000/api/v1/orders/:id/reorder`

**Description:** سفارش مجدد

**Authorization:** 🔒 Required

---

### Kitchen Routes

### 6.14 Get Today's Orders (Kitchen)

**`GET`** `http://localhost:3000/api/v1/orders/kitchen/today`

**Description:** سفارشات امروز (آشپزخانه)

**Authorization:** 🔒 Required (Kitchen)

---

### 6.15 Get Kitchen Queue

**`GET`** `http://localhost:3000/api/v1/orders/kitchen/queue`

**Description:** صف سفارشات

**Authorization:** 🔒 Required (Kitchen)

---

### 6.16 Get Kitchen Summary

**`GET`** `http://localhost:3000/api/v1/orders/kitchen/summary`

**Description:** خلاصه آشپزخانه

**Authorization:** 🔒 Required (Kitchen)

| Query Param | Type | Description |
|-------------|------|-------------|
| date | date | تاریخ |

---

### 6.17 Update Kitchen Order Status

**`PATCH`** `http://localhost:3000/api/v1/orders/kitchen/:id/status`

**Description:** تغییر وضعیت سفارش (آشپزخانه)

**Authorization:** 🔒 Required (Kitchen)

---

### Company Orders

### 6.18 Get Company Orders

**`GET`** `http://localhost:3000/api/v1/orders/company/:companyId`

**Description:** سفارشات شرکت

**Authorization:** 🔒 Required (Company Admin)

---

### 6.19 Get Company Order Summary

**`GET`** `http://localhost:3000/api/v1/orders/company/:companyId/summary`

**Description:** خلاصه سفارشات شرکت

**Authorization:** 🔒 Required (Company Admin)

| Query Param | Type | Description |
|-------------|------|-------------|
| fromDate | date | از تاریخ |
| toDate | date | تا تاریخ |

---

### Reservations

### 6.20 Create Weekly Reservation

**`POST`** `http://localhost:3000/api/v1/orders/reservations`

**Description:** ایجاد رزرو هفتگی

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "weekStartDate": "2024-01-15",
  "items": [
    {
      "date": "2024-01-15",
      "mealType": "lunch",
      "foodId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 1
    }
  ]
}
```

---

### 6.21 Get Current Reservation

**`GET`** `http://localhost:3000/api/v1/orders/reservations/current`

**Description:** رزرو هفتگی جاری

**Authorization:** 🔒 Required

---

### 6.22 Get Reservation by ID

**`GET`** `http://localhost:3000/api/v1/orders/reservations/:id`

**Description:** دریافت رزرو

**Authorization:** 🔒 Required

---

### 6.23 Update Reservation

**`PUT`** `http://localhost:3000/api/v1/orders/reservations/:id`

**Description:** ویرایش رزرو هفتگی

**Authorization:** 🔒 Required

---

### 6.24 Cancel Reservation Day

**`DELETE`** `http://localhost:3000/api/v1/orders/reservations/:id/day/:date`

**Description:** لغو یک روز از رزرو

**Authorization:** 🔒 Required

---

### 6.25 Cancel Reservation

**`DELETE`** `http://localhost:3000/api/v1/orders/reservations/:id`

**Description:** لغو کامل رزرو

**Authorization:** 🔒 Required

---

## 7. Wallet Service

Base Path: `/api/v1/wallets`

### Personal Wallet

### 7.1 Get Balance

**`GET`** `http://localhost:3000/api/v1/wallets/balance`

**Description:** دریافت موجودی کیف پول

**Authorization:** 🔒 Required

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "personalBalance": 500000,
    "companyBalance": 200000,
    "totalBalance": 700000,
    "currency": "تومان"
  }
}
```

---

### 7.2 Get Transactions

**`GET`** `http://localhost:3000/api/v1/wallets/transactions`

**Description:** تاریخچه تراکنش‌ها

**Authorization:** 🔒 Required

| Query Param | Type | Description |
|-------------|------|-------------|
| page | number | شماره صفحه |
| limit | number | تعداد در صفحه |
| type | string | نوع تراکنش |
| balanceType | string | `personal`, `company` |

| Transaction Types |
|-------------------|
| `topup_personal` |
| `topup_company` |
| `subsidy_allocation` |
| `order_payment` |
| `order_refund` |

---

### 7.3 Top Up Personal Wallet

**`POST`** `http://localhost:3000/api/v1/wallets/topup`

**Description:** شارژ کیف پول شخصی

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "amount": 100000,
  "description": "شارژ کیف پول"
}
```

#### 📤 Response Example (201)

```json
{
  "success": true,
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 100000,
    "newBalance": 600000,
    "paymentUrl": "https://payment.gateway/pay/..."
  },
  "message": "درخواست شارژ ثبت شد"
}
```

---

### Company Wallet

### 7.4 Get Company Pool

**`GET`** `http://localhost:3000/api/v1/wallets/company/:companyId`

**Description:** دریافت اطلاعات حساب شرکت

**Authorization:** 🔒 Required (Company Admin)

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "balance": 5000000,
    "allocatedAmount": 2000000,
    "availableAmount": 3000000,
    "employeeCount": 50
  }
}
```

---

### 7.5 Top Up Company Account

**`POST`** `http://localhost:3000/api/v1/wallets/company/:companyId/topup`

**Description:** شارژ حساب شرکت

**Authorization:** 🔒 Required (Company Admin)

#### 📥 Request Example

```json
{
  "amount": 1000000,
  "description": "شارژ ماهانه"
}
```

---

### 7.6 Allocate Subsidy

**`POST`** `http://localhost:3000/api/v1/wallets/company/:companyId/allocate`

**Description:** تخصیص یارانه به کارمند

**Authorization:** 🔒 Required (Company Admin)

#### 📥 Request Example

```json
{
  "employeeUserId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "description": "یارانه ناهار دی ماه"
}
```

---

### 7.7 Get Company Employees Wallets

**`GET`** `http://localhost:3000/api/v1/wallets/company/:companyId/employees`

**Description:** لیست کیف پول کارمندان

**Authorization:** 🔒 Required (Company Admin)

---

## 8. Payment Service

Base Path: `/api/v1/payments`

### 8.1 Create Payment Request

**`POST`** `http://localhost:3000/api/v1/payments/request`

**Description:** ایجاد درخواست پرداخت

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 240000,
  "gateway": "zarinpal",
  "description": "پرداخت سفارش ORD-1403-0001"
}
```

#### 📤 Response Example (201)

```json
{
  "success": true,
  "data": {
    "paymentId": "660e8400-e29b-41d4-a716-446655440000",
    "trackingCode": "PAY-1403-0001",
    "amount": 240000,
    "gateway": "zarinpal",
    "paymentUrl": "https://www.zarinpal.com/pg/StartPay/..."
  },
  "message": "درخواست پرداخت ایجاد شد"
}
```

---

### 8.2 Verify Payment (Callback)

**`GET`** `http://localhost:3000/api/v1/payments/verify`

**Description:** بازگشت از درگاه پرداخت

**Authorization:** 🔓 Public

| Query Param | Type | Description |
|-------------|------|-------------|
| paymentId | string | شناسه پرداخت |
| Authority | string | کد درگاه |
| Status | string | وضعیت |

---

### 8.3 Verify Payment (API)

**`POST`** `http://localhost:3000/api/v1/payments/verify`

**Description:** تایید پرداخت

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "paymentId": "660e8400-e29b-41d4-a716-446655440000",
  "Authority": "A00000000000000000000000000123456789",
  "Status": "OK"
}
```

---

### 8.4 Get Payment History

**`GET`** `http://localhost:3000/api/v1/payments/history`

**Description:** تاریخچه پرداخت‌های کاربر

**Authorization:** 🔒 Required

| Query Param | Type | Description |
|-------------|------|-------------|
| page | number | شماره صفحه |
| limit | number | تعداد در صفحه |
| status | string | `pending`, `processing`, `completed`, `failed`, `refunded` |
| fromDate | date | از تاریخ |
| toDate | date | تا تاریخ |

---

### 8.5 Track Payment

**`GET`** `http://localhost:3000/api/v1/payments/tracking/:trackingCode`

**Description:** پیگیری پرداخت با کد رهگیری

**Authorization:** 🔓 Public

---

### 8.6 Get Payment by ID

**`GET`** `http://localhost:3000/api/v1/payments/:id`

**Description:** دریافت اطلاعات پرداخت

**Authorization:** 🔒 Required

---

### 8.7 Request Refund

**`POST`** `http://localhost:3000/api/v1/payments/:id/refund`

**Description:** درخواست استرداد وجه

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "reason": "لغو سفارش توسط مشتری"
}
```

---

## 9. Invoice Service

Base Path: `/api/v1/invoices`

### 9.1 Create Invoice

**`POST`** `http://localhost:3000/api/v1/invoices`

**Description:** ایجاد فاکتور جدید

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "type": "instant",
  "items": [
    {
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "description": "چلوکباب کوبیده",
      "quantity": 2,
      "unitPrice": 150000
    }
  ],
  "discount": 0,
  "taxRate": 9,
  "customerName": "علی محمدی",
  "customerEmail": "ali@example.com"
}
```

---

### 9.2 Get User Invoices

**`GET`** `http://localhost:3000/api/v1/invoices`

**Description:** لیست فاکتورهای کاربر

**Authorization:** 🔒 Required

| Query Param | Type | Description |
|-------------|------|-------------|
| page | number | شماره صفحه |
| limit | number | تعداد در صفحه |
| status | string | `draft`, `issued`, `sent`, `paid`, `cancelled` |
| type | string | `instant`, `consolidated`, `proforma` |
| fromDate | date | از تاریخ |
| toDate | date | تا تاریخ |

---

### 9.3 Get Invoice by ID

**`GET`** `http://localhost:3000/api/v1/invoices/:id`

**Description:** دریافت جزئیات فاکتور

**Authorization:** 🔒 Required

---

### 9.4 Get Invoice by Number

**`GET`** `http://localhost:3000/api/v1/invoices/number/:invoiceNumber`

**Description:** دریافت فاکتور با شماره فاکتور

**Authorization:** 🔒 Required

---

### 9.5 Update Invoice Status

**`PATCH`** `http://localhost:3000/api/v1/invoices/:id/status`

**Description:** تغییر وضعیت فاکتور

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "status": "paid"
}
```

---

### 9.6 Get Invoice PDF Link

**`GET`** `http://localhost:3000/api/v1/invoices/:id/pdf`

**Description:** دریافت لینک PDF فاکتور

**Authorization:** 🔒 Required

---

### 9.7 Download Invoice PDF

**`GET`** `http://localhost:3000/api/v1/invoices/:id/download`

**Description:** دانلود PDF فاکتور

**Authorization:** 🔒 Required

---

### 9.8 Send Invoice

**`POST`** `http://localhost:3000/api/v1/invoices/:id/send`

**Description:** ارسال فاکتور به ایمیل مشتری

**Authorization:** 🔒 Required

---

### Company Invoices

### 9.9 Get Company Invoices

**`GET`** `http://localhost:3000/api/v1/invoices/company/:companyId`

**Description:** لیست فاکتورهای شرکت

**Authorization:** 🔒 Required (Company Admin)

---

### 9.10 Preview Consolidated Invoice

**`POST`** `http://localhost:3000/api/v1/invoices/company/consolidated/preview`

**Description:** پیش‌نمایش فاکتور تجمیعی

**Authorization:** 🔒 Required (Company Admin)

#### 📥 Request Example

```json
{
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31"
}
```

---

### 9.11 Generate Consolidated Invoice

**`POST`** `http://localhost:3000/api/v1/invoices/company/consolidated`

**Description:** ایجاد فاکتور تجمیعی

**Authorization:** 🔒 Required (Company Admin)

---

## 10. Notification Service

Base Path: `/api/v1/notifications`

### 10.1 Get User Notifications

**`GET`** `http://localhost:3000/api/v1/notifications`

**Description:** لیست اعلان‌های کاربر

**Authorization:** 🔒 Required

| Query Param | Type | Description |
|-------------|------|-------------|
| page | number | شماره صفحه |
| limit | number | تعداد در صفحه |
| type | string | `email`, `sms`, `push`, `in_app` |
| status | string | `pending`, `sent`, `failed`, `read` |
| category | string | `order`, `payment`, `wallet`, `company`, `system`, `promotion` |

---

### 10.2 Get Unread Count

**`GET`** `http://localhost:3000/api/v1/notifications/unread-count`

**Description:** تعداد اعلان‌های خوانده نشده

**Authorization:** 🔒 Required

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### 10.3 Get Notification Preferences

**`GET`** `http://localhost:3000/api/v1/notifications/preferences`

**Description:** دریافت تنظیمات اعلان

**Authorization:** 🔒 Required

---

### 10.4 Update Notification Preferences

**`PUT`** `http://localhost:3000/api/v1/notifications/preferences`

**Description:** به‌روزرسانی تنظیمات اعلان

**Authorization:** 🔒 Required

#### 📥 Request Example

```json
{
  "email": {
    "enabled": true,
    "address": "user@example.com"
  },
  "sms": {
    "enabled": false,
    "phone": "09121234567"
  },
  "categories": {
    "order": true,
    "payment": true,
    "promotion": false
  }
}
```

---

### 10.5 Mark All as Read

**`PATCH`** `http://localhost:3000/api/v1/notifications/read-all`

**Description:** خوانده شدن همه اعلان‌ها

**Authorization:** 🔒 Required

---

### 10.6 Mark as Read

**`PATCH`** `http://localhost:3000/api/v1/notifications/:id/read`

**Description:** علامت‌گذاری به عنوان خوانده شده

**Authorization:** 🔒 Required

---

### 10.7 Send Notification (Admin)

**`POST`** `http://localhost:3000/api/v1/notifications/send`

**Description:** ارسال اعلان دستی

**Authorization:** 🔒 Required (Admin)

#### 📥 Request Example

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "in_app",
  "category": "system",
  "title": "اطلاعیه مهم",
  "body": "سیستم در ساعت ۲ شب به‌روزرسانی می‌شود"
}
```

---

## 11. Reporting Service

Base Path: `/api/v1/reports`

### 11.1 Get Dashboard

**`GET`** `http://localhost:3000/api/v1/reports/dashboard`

**Description:** داشبورد مدیریتی

**Authorization:** 🔒 Required (Admin/Company Admin)

#### 📤 Response Example (200)

```json
{
  "success": true,
  "data": {
    "date": "۱۴۰۳/۱۰/۱۵",
    "metrics": {
      "todayOrders": 125,
      "todayRevenue": 15000000,
      "pendingOrders": 23,
      "activeUsers": 450
    }
  }
}
```

---

### 11.2 Get Daily Report

**`GET`** `http://localhost:3000/api/v1/reports/orders/daily`

**Description:** گزارش سفارشات روزانه

**Authorization:** 🔒 Required (Admin/Company Admin)

| Query Param | Type | Description |
|-------------|------|-------------|
| date | date | تاریخ گزارش (پیش‌فرض: امروز) |

---

### 11.3 Get Monthly Report

**`GET`** `http://localhost:3000/api/v1/reports/orders/monthly`

**Description:** گزارش سفارشات ماهانه

**Authorization:** 🔒 Required (Admin/Company Admin)

| Query Param | Type | Description |
|-------------|------|-------------|
| year | number | سال شمسی |
| month | number | ماه (۱-۱۲) |

---

### 11.4 Get Revenue Report

**`GET`** `http://localhost:3000/api/v1/reports/revenue`

**Description:** گزارش درآمد

**Authorization:** 🔒 Required (Admin/Company Admin)

| Query Param | Type | Description |
|-------------|------|-------------|
| startDate | datetime | تاریخ شروع |
| endDate | datetime | تاریخ پایان |
| groupBy | string | `day`, `week`, `month` |

---

### 11.5 Get Company Consumption

**`GET`** `http://localhost:3000/api/v1/reports/company/:id/consumption`

**Description:** گزارش مصرف شرکت

**Authorization:** 🔒 Required (Admin/Company Admin)

| Query Param | Type | Description |
|-------------|------|-------------|
| startDate | datetime | تاریخ شروع |
| endDate | datetime | تاریخ پایان |

---

### 11.6 Get Popular Items

**`GET`** `http://localhost:3000/api/v1/reports/popular-items`

**Description:** غذاهای پرطرفدار

**Authorization:** 🔒 Required (Admin/Company Admin)

| Query Param | Type | Description |
|-------------|------|-------------|
| limit | number | تعداد (پیش‌فرض: ۱۰) |
| startDate | datetime | تاریخ شروع |
| endDate | datetime | تاریخ پایان |

---

### 11.7 Export Report

**`GET`** `http://localhost:3000/api/v1/reports/export`

**Description:** خروجی Excel

**Authorization:** 🔒 Required (Admin/Company Admin)

| Query Param | Type | Description |
|-------------|------|-------------|
| type | string | `daily`, `monthly`, `revenue`, `company`, `popular` |
| date | date | تاریخ (برای روزانه) |
| year | number | سال (برای ماهانه) |
| month | number | ماه (برای ماهانه) |
| startDate | datetime | تاریخ شروع |
| endDate | datetime | تاریخ پایان |
| companyId | uuid | شناسه شرکت |
| limit | number | تعداد |

---

## 12. File Service

Base Path: `/api/v1/files`

### 12.1 Get User Files

**`GET`** `http://localhost:3000/api/v1/files`

**Description:** لیست فایل‌های کاربر

**Authorization:** 🔒 Required

| Query Param | Type | Description |
|-------------|------|-------------|
| page | number | شماره صفحه |
| limit | number | تعداد در صفحه |
| category | string | `image`, `document`, `spreadsheet`, `other` |

---

### 12.2 Upload File

**`POST`** `http://localhost:3000/api/v1/files/upload`

**Description:** آپلود فایل

**Authorization:** 🔒 Required

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | ✅ | فایل برای آپلود |
| isPublic | boolean | ❌ | آیا فایل عمومی باشد؟ |
| referenceType | string | ❌ | نوع مرجع (menu, company) |
| referenceId | uuid | ❌ | شناسه مرجع |

#### 📤 Response Example (201)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "menu-item.jpg",
    "originalName": "کباب.jpg",
    "mimeType": "image/jpeg",
    "size": 245678,
    "url": "https://storage.example.com/files/..."
  },
  "message": "فایل آپلود شد"
}
```

---

### 12.3 Bulk Upload

**`POST`** `http://localhost:3000/api/v1/files/bulk-upload`

**Description:** آپلود دسته‌ای (حداکثر ۱۰ فایل)

**Authorization:** 🔒 Required

**Content-Type:** `multipart/form-data`

---

### 12.4 Download File

**`GET`** `http://localhost:3000/api/v1/files/:id`

**Description:** دانلود فایل

**Authorization:** 🔒 Required

---

### 12.5 Get File Info

**`GET`** `http://localhost:3000/api/v1/files/:id/info`

**Description:** اطلاعات فایل

**Authorization:** 🔒 Required

---

### 12.6 Get File URL

**`GET`** `http://localhost:3000/api/v1/files/:id/url`

**Description:** دریافت URL فایل

**Authorization:** 🔒 Required

---

### 12.7 Get Thumbnail

**`GET`** `http://localhost:3000/api/v1/files/:id/thumbnail`

**Description:** تصویر بندانگشتی

**Authorization:** 🔒 Required

---

### 12.8 Delete File

**`DELETE`** `http://localhost:3000/api/v1/files/:id`

**Description:** حذف فایل

**Authorization:** 🔒 Required

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERR_1001",
    "message": "پیام خطا به فارسی",
    "details": []
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ERR_1001 | 400 | درخواست نامعتبر |
| ERR_1002 | 401 | عدم احراز هویت |
| ERR_1003 | 403 | عدم دسترسی |
| ERR_1004 | 404 | یافت نشد |
| ERR_1005 | 409 | تداخل داده |
| ERR_1006 | 422 | خطای اعتبارسنجی |
| ERR_1007 | 429 | تعداد درخواست بیش از حد |
| ERR_1008 | 503 | سرویس در دسترس نیست |
| ERR_5000 | 500 | خطای داخلی سرور |

---

## Rate Limiting

- **Auth endpoints:** 5 requests per minute
- **General endpoints:** 100 requests per minute
- **File upload:** 10 requests per minute

---

## Pagination

Paginated endpoints return data in the following format:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

*Generated: January 2026*
*Version: 1.0.0*
