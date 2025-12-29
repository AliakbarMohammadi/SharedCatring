# پرامپت برای Kiro - پیاده‌سازی سامانه کترینگ

## 📋 پرامپت اصلی (Main Prompt)

```markdown
# پروژه: سامانه کترینگ سازمانی - معماری میکروسرویس

## 🎯 هدف پروژه
پیاده‌سازی یک سامانه کترینگ سازمانی با معماری میکروسرویس که شامل 13 سرویس مستقل است. هر سرویس باید به صورت جداگانه قابل اجرا و تست با Postman باشد.

## 🛠️ تکنولوژی‌های مورد استفاده
- **Runtime:** Node.js (v18+)
- **Language:** JavaScript (ES6+)
- **Framework:** Express.js
- **Databases:** PostgreSQL, MongoDB, Redis
- **Message Broker:** RabbitMQ
- **File Storage:** MinIO
- **Containerization:** Docker & Docker Compose

## 📁 ساختار کلی پروژه

```
catering-system/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── identity-service/
│   ├── user-service/
│   ├── company-service/
│   ├── menu-service/
│   ├── order-service/
│   ├── invoice-service/
│   ├── payment-service/
│   ├── wallet-service/
│   ├── notification-service/
│   ├── reporting-service/
│   └── file-service/
├── packages/
│   ├── common/
│   ├── event-bus/
│   ├── service-client/
│   └── logger/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

## 📐 ساختار استاندارد هر سرویس

هر سرویس باید این ساختار را داشته باشد:

```
service-name/
├── src/
│   ├── config/
│   │   ├── index.js
│   │   ├── database.js
│   │   └── swagger.js
│   ├── api/
│   │   ├── routes/
│   │   │   └── v1/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── validators/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── events/
│   │   ├── publishers/
│   │   └── subscribers/
│   ├── utils/
│   └── app.js
├── tests/
├── docs/
│   └── openapi.yaml
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## ✅ الزامات هر سرویس

1. **Swagger Documentation:** هر سرویس باید مستندات Swagger داشته باشد در مسیر `/api-docs`
2. **Health Check:** هر سرویس باید endpoint `/health` داشته باشد
3. **Error Handling:** مدیریت خطای یکپارچه با فرمت استاندارد JSON
4. **Validation:** اعتبارسنجی ورودی‌ها با Joi یا express-validator
5. **Logging:** لاگ‌گذاری با Winston
6. **Environment Variables:** استفاده از dotenv برای تنظیمات
7. **Docker Ready:** قابل اجرا با Docker

## 🔄 فرمت پاسخ API استاندارد

```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": []
  }
}
```

## 🚀 دستورات اجرا

هر سرویس باید با این دستورات قابل اجرا باشد:

```bash
# نصب وابستگی‌ها
npm install

# اجرای توسعه
npm run dev

# اجرای تست
npm test

# اجرای production
npm start
```

---

اکنون لطفاً سرویس‌ها را به ترتیب زیر پیاده‌سازی کن. برای هر سرویس منتظر تایید من باش.
```

---

## 🔢 پرامپت‌های جداگانه برای هر سرویس

### 1️⃣ Packages (پکیج‌های مشترک)

```markdown
## سرویس شماره 0: Shared Packages

لطفاً ابتدا پکیج‌های مشترک را ایجاد کن:

### packages/common
شامل:
- `errors/` - کلاس‌های خطای سفارشی (AppError, ValidationError, NotFoundError, UnauthorizedError)
- `middlewares/` - میان‌افزارهای مشترک (errorHandler, requestLogger)
- `utils/` - توابع کمکی (pagination, response formatter, date helpers)
- `constants/` - ثابت‌ها (roles, orderStatus, companyStatus)

### packages/logger
- پیکربندی Winston Logger
- فرمت‌های مختلف (console, file, json)

### packages/event-bus
- کلاینت RabbitMQ
- Publisher و Subscriber base classes
- تعریف Event types

### packages/service-client
- Base HTTP Client با axios
- Retry logic
- Circuit breaker pattern

خروجی مورد انتظار:
- هر پکیج باید package.json مجزا داشته باشد
- قابل import در سرویس‌های دیگر باشد
```

---

### 2️⃣ API Gateway

```markdown
## سرویس شماره 1: API Gateway

**Port:** 3000
**Database:** Redis (برای rate limiting و caching)

### وظایف:
- روتینگ درخواست‌ها به سرویس‌های مختلف
- احراز هویت JWT
- Rate Limiting
- Request/Response Logging
- CORS handling

### Endpoints:
- تمام درخواست‌های `/api/v1/*` را به سرویس مربوطه route کند

### Route Mapping:
```javascript
const routes = {
  '/api/v1/auth': 'http://auth-service:3001',
  '/api/v1/identity': 'http://identity-service:3002',
  '/api/v1/users': 'http://user-service:3003',
  '/api/v1/companies': 'http://company-service:3004',
  '/api/v1/menu': 'http://menu-service:3005',
  '/api/v1/orders': 'http://order-service:3006',
  '/api/v1/invoices': 'http://invoice-service:3007',
  '/api/v1/payments': 'http://payment-service:3008',
  '/api/v1/wallets': 'http://wallet-service:3009',
  '/api/v1/notifications': 'http://notification-service:3010',
  '/api/v1/reports': 'http://reporting-service:3011',
  '/api/v1/files': 'http://file-service:3012'
};
```

### Public Routes (بدون نیاز به احراز هویت):
- POST /api/v1/auth/login
- POST /api/v1/auth/register
- POST /api/v1/auth/forgot-password
- GET /api/v1/menu/daily
- GET /health

### فایل‌های مورد نیاز:
1. `src/app.js` - Entry point
2. `src/config/index.js` - تنظیمات
3. `src/config/routes.js` - Route mapping
4. `src/middlewares/auth.middleware.js` - JWT verification
5. `src/middlewares/rateLimiter.middleware.js` - Rate limiting
6. `src/middlewares/proxy.middleware.js` - Proxy to services
7. `src/utils/redis.js` - Redis client

### Postman Collection:
یک collection برای تست API Gateway ایجاد کن که شامل:
- Health check
- تست rate limiting
- تست routing

لطفاً کد کامل این سرویس را ایجاد کن.
```

---

### 3️⃣ Auth Service

```markdown
## سرویس شماره 2: Auth Service

**Port:** 3001
**Database:** MongoDB

### وظایف:
- ثبت‌نام کاربران
- ورود و صدور JWT
- مدیریت Refresh Token
- فراموشی رمز عبور
- اعتبارسنجی توکن

### Database Collections:

```javascript
// tokens collection
{
  _id: ObjectId,
  userId: String,
  token: String,
  type: 'refresh' | 'reset' | 'verify',
  expiresAt: Date,
  createdAt: Date,
  isRevoked: Boolean
}

// sessions collection
{
  _id: ObjectId,
  userId: String,
  deviceInfo: {
    userAgent: String,
    ip: String,
    device: String
  },
  createdAt: Date,
  lastActivityAt: Date,
  isActive: Boolean
}
```

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | ثبت‌نام کاربر جدید |
| POST | /api/v1/auth/login | ورود کاربر |
| POST | /api/v1/auth/refresh-token | تمدید توکن |
| POST | /api/v1/auth/logout | خروج |
| POST | /api/v1/auth/forgot-password | درخواست بازیابی رمز |
| POST | /api/v1/auth/reset-password | بازنشانی رمز |
| POST | /api/v1/auth/verify-token | اعتبارسنجی توکن |
| GET | /health | Health check |

### Request/Response Examples:

#### POST /api/v1/auth/register
```json
// Request
{
  "email": "user@example.com",
  "phone": "09121234567",
  "password": "SecurePass123!",
  "role": "personal_user"
}

// Response
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "message": "لطفاً ایمیل خود را تایید کنید"
  }
}
```

#### POST /api/v1/auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "personal_user"
    }
  }
}
```

### Events Published:
- `auth.user.registered`
- `auth.user.logged_in`
- `auth.user.logged_out`
- `auth.password.reset`

### فایل‌های مورد نیاز:
1. Models: Token, Session
2. Controllers: auth.controller.js
3. Services: auth.service.js, token.service.js
4. Validators: auth.validator.js
5. Routes: auth.routes.js

### نکات فنی:
- استفاده از bcrypt برای hash کردن رمز
- JWT با expiry مناسب (access: 1h, refresh: 7d)
- ذخیره refresh token در database
- Rate limiting برای login (5 تلاش در دقیقه)

لطفاً کد کامل این سرویس را ایجاد کن با Swagger documentation.
```

---

### 4️⃣ Identity Service

```markdown
## سرویس شماره 3: Identity Service

**Port:** 3002
**Database:** PostgreSQL

### وظایف:
- مدیریت کاربران (CRUD)
- مدیریت نقش‌ها (Roles)
- مدیریت دسترسی‌ها (Permissions)
- تخصیص نقش به کاربر

### Database Tables:

```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    status VARCHAR(20) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    description TEXT
);

-- role_permissions table
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);
```

### Default Roles:
```javascript
const defaultRoles = [
  { name: 'super_admin', description: 'مدیر ارشد سیستم' },
  { name: 'catering_admin', description: 'مدیر کترینگ' },
  { name: 'kitchen_staff', description: 'پرسنل آشپزخانه' },
  { name: 'company_admin', description: 'مدیر شرکت' },
  { name: 'company_manager', description: 'مدیر واحد شرکت' },
  { name: 'employee', description: 'کارمند شرکت' },
  { name: 'personal_user', description: 'کاربر شخصی' }
];
```

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/identity/users | ایجاد کاربر |
| GET | /api/v1/identity/users | لیست کاربران |
| GET | /api/v1/identity/users/:id | دریافت کاربر |
| PUT | /api/v1/identity/users/:id | ویرایش کاربر |
| DELETE | /api/v1/identity/users/:id | حذف کاربر |
| PATCH | /api/v1/identity/users/:id/status | تغییر وضعیت |
| POST | /api/v1/identity/users/:id/assign-role | تخصیص نقش |
| GET | /api/v1/identity/roles | لیست نقش‌ها |
| POST | /api/v1/identity/roles | ایجاد نقش |
| GET | /api/v1/identity/roles/:id | دریافت نقش |
| PUT | /api/v1/identity/roles/:id | ویرایش نقش |
| GET | /api/v1/identity/permissions | لیست دسترسی‌ها |
| POST | /api/v1/identity/roles/:id/permissions | تخصیص دسترسی |

### Events Published:
- `identity.user.created`
- `identity.user.updated`
- `identity.user.deleted`
- `identity.role.assigned`

### فایل‌های مورد نیاز:
1. Models: User, Role, Permission (با Sequelize یا Knex)
2. Migrations: برای ایجاد tables
3. Seeds: برای داده‌های اولیه (roles, permissions)
4. Controllers, Services, Repositories

لطفاً کد کامل این سرویس را ایجاد کن.
```

---

### 5️⃣ User Service

```markdown
## سرویس شماره 4: User Service

**Port:** 3003
**Database:** PostgreSQL

### وظایف:
- مدیریت پروفایل کاربر
- مدیریت تنظیمات کاربر
- مدیریت آدرس‌های کاربر

### Database Tables:

```sql
-- user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    national_code VARCHAR(10),
    avatar_url VARCHAR(500),
    birth_date DATE,
    gender VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- user_preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    dietary_restrictions TEXT[], -- ['vegetarian', 'gluten-free']
    allergies TEXT[],
    favorite_foods UUID[],
    notification_settings JSONB DEFAULT '{}',
    language VARCHAR(5) DEFAULT 'fa',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- user_addresses table
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/users/profile | دریافت پروفایل |
| PUT | /api/v1/users/profile | ویرایش پروفایل |
| PUT | /api/v1/users/profile/avatar | آپلود آواتار |
| GET | /api/v1/users/preferences | دریافت تنظیمات |
| PUT | /api/v1/users/preferences | ویرایش تنظیمات |
| GET | /api/v1/users/addresses | لیست آدرس‌ها |
| POST | /api/v1/users/addresses | افزودن آدرس |
| PUT | /api/v1/users/addresses/:id | ویرایش آدرس |
| DELETE | /api/v1/users/addresses/:id | حذف آدرس |
| PATCH | /api/v1/users/addresses/:id/default | تنظیم پیش‌فرض |

### Events Subscribed:
- `identity.user.created` → ایجاد پروفایل خالی

### نکات:
- User ID از JWT token استخراج می‌شود
- آواتار از File Service آپلود می‌شود

لطفاً کد کامل این سرویس را ایجاد کن.
```

---

### 6️⃣ Company Service

```markdown
## سرویس شماره 5: Company Service

**Port:** 3004
**Database:** PostgreSQL

### وظایف:
- ثبت و مدیریت شرکت‌ها
- تایید/رد شرکت‌ها توسط ادمین
- مدیریت دپارتمان‌ها
- مدیریت کارمندان (تکی و دسته‌ای)
- مدیریت شیفت‌های تحویل
- تنظیمات یارانه غذا

### Database Tables:

```sql
-- companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(50) UNIQUE,
    tax_id VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    admin_user_id UUID NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(15),
    email VARCHAR(255),
    logo_url VARCHAR(500),
    contract_type VARCHAR(20),
    contract_start_date DATE,
    contract_end_date DATE,
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    approved_at TIMESTAMP,
    approved_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    parent_id UUID REFERENCES departments(id),
    manager_user_id UUID,
    monthly_budget DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id),
    department_id UUID REFERENCES departments(id),
    employee_code VARCHAR(50),
    job_title VARCHAR(100),
    shift_id UUID REFERENCES delivery_shifts(id),
    daily_subsidy_limit DECIMAL(10, 2),
    monthly_subsidy_limit DECIMAL(15, 2),
    subsidy_percentage INTEGER DEFAULT 100,
    can_order BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    joined_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- delivery_shifts table
CREATE TABLE delivery_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(50) NOT NULL,
    delivery_time TIME NOT NULL,
    order_deadline TIME NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- subsidy_rules table
CREATE TABLE subsidy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(100),
    rule_type VARCHAR(20),
    percentage INTEGER,
    fixed_amount DECIMAL(10, 2),
    max_per_meal DECIMAL(10, 2),
    max_per_day DECIMAL(10, 2),
    max_per_month DECIMAL(15, 2),
    applicable_meals TEXT[],
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0
);
```

### Company Status Flow:
```
PENDING → REVIEWING → APPROVED → ACTIVE
                   ↘ REJECTED
         ACTIVE → SUSPENDED → ACTIVE
```

### Endpoints:

#### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/companies | ثبت شرکت جدید |
| GET | /api/v1/companies | لیست شرکت‌ها (admin) |
| GET | /api/v1/companies/:id | جزئیات شرکت |
| PUT | /api/v1/companies/:id | ویرایش شرکت |
| PATCH | /api/v1/companies/:id/status | تغییر وضعیت (admin) |
| GET | /api/v1/companies/:id/dashboard | داشبورد شرکت |

#### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/companies/:id/departments | ایجاد دپارتمان |
| GET | /api/v1/companies/:id/departments | لیست دپارتمان‌ها |
| PUT | /api/v1/companies/:id/departments/:deptId | ویرایش |
| DELETE | /api/v1/companies/:id/departments/:deptId | حذف |

#### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/companies/:id/employees | افزودن کارمند |
| POST | /api/v1/companies/:id/employees/bulk | ایمپورت اکسل |
| GET | /api/v1/companies/:id/employees | لیست کارمندان |
| GET | /api/v1/companies/:id/employees/:empId | جزئیات کارمند |
| PUT | /api/v1/companies/:id/employees/:empId | ویرایش |
| DELETE | /api/v1/companies/:id/employees/:empId | حذف |
| GET | /api/v1/companies/:id/employees/export | خروجی اکسل |

#### Shifts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/companies/:id/shifts | ایجاد شیفت |
| GET | /api/v1/companies/:id/shifts | لیست شیفت‌ها |
| PUT | /api/v1/companies/:id/shifts/:shiftId | ویرایش |

#### Subsidy Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/companies/:id/subsidy-rules | ایجاد قانون یارانه |
| GET | /api/v1/companies/:id/subsidy-rules | لیست قوانین |
| PUT | /api/v1/companies/:id/subsidy-rules/:ruleId | ویرایش |

### Excel Import Format:
```
| نام | نام‌خانوادگی | کد ملی | موبایل | ایمیل | دپارتمان | کد کارمندی |
```

### Events Published:
- `company.registered`
- `company.approved`
- `company.rejected`
- `company.suspended`
- `employee.added`
- `employee.removed`
- `employees.bulk_imported`

### Events Subscribed:
- `identity.user.created`

لطفاً کد کامل این سرویس را ایجاد کن با قابلیت Excel import/export.
```

---

### 7️⃣ Menu Service

```markdown
## سرویس شماره 6: Menu Service

**Port:** 3005
**Database:** MongoDB

### وظایف:
- مدیریت دسته‌بندی غذاها
- مدیریت آیتم‌های غذا
- زمان‌بندی منوی روزانه/هفتگی
- قیمت‌گذاری (عادی و سازمانی)
- مدیریت موجودی

### Database Collections:

```javascript
// categories collection
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  image: String,
  parentId: ObjectId | null,
  order: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// food_items collection
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  categoryId: ObjectId,
  images: [String],
  thumbnailImage: String,
  
  pricing: {
    basePrice: Number,
    discountedPrice: Number | null,
    corporatePrices: [{
      companyId: String,
      price: Number,
      discountPercentage: Number
    }]
  },
  
  nutrition: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number
  },
  
  attributes: {
    isVegetarian: Boolean,
    isVegan: Boolean,
    isGlutenFree: Boolean,
    isSpicy: Boolean,
    spicyLevel: Number,
    servingSize: String,
    preparationTime: Number
  },
  
  allergens: [String],
  ingredients: [String],
  tags: [String],
  
  rating: {
    average: Number,
    count: Number
  },
  
  isAvailable: Boolean,
  isFeatured: Boolean,
  sortOrder: Number,
  
  createdAt: Date,
  updatedAt: Date
}

// menu_schedules collection
{
  _id: ObjectId,
  date: Date,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  items: [{
    foodId: ObjectId,
    maxQuantity: Number,
    remainingQuantity: Number,
    specialPrice: Number | null
  }],
  orderDeadline: Date,
  isActive: Boolean,
  createdAt: Date
}

// promotions collection
{
  _id: ObjectId,
  code: String,
  name: String,
  type: 'percentage' | 'fixed',
  value: Number,
  minOrderAmount: Number,
  maxDiscount: Number,
  applicableItems: [ObjectId],
  applicableCategories: [ObjectId],
  startDate: Date,
  endDate: Date,
  usageLimit: Number,
  usedCount: Number,
  isActive: Boolean
}
```

### Endpoints:

#### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/menu/categories | لیست دسته‌بندی‌ها |
| POST | /api/v1/menu/categories | ایجاد دسته‌بندی |
| GET | /api/v1/menu/categories/:id | جزئیات |
| PUT | /api/v1/menu/categories/:id | ویرایش |
| DELETE | /api/v1/menu/categories/:id | حذف |
| PATCH | /api/v1/menu/categories/:id/order | تغییر ترتیب |

#### Food Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/menu/items | لیست غذاها |
| POST | /api/v1/menu/items | افزودن غذا |
| GET | /api/v1/menu/items/:id | جزئیات غذا |
| PUT | /api/v1/menu/items/:id | ویرایش |
| DELETE | /api/v1/menu/items/:id | حذف |
| PATCH | /api/v1/menu/items/:id/availability | تغییر موجودی |
| GET | /api/v1/menu/items/:id/nutrition | اطلاعات تغذیه‌ای |
| GET | /api/v1/menu/items/popular | پرطرفدارها |

#### Daily/Weekly Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/menu/daily | منوی امروز (Public) |
| GET | /api/v1/menu/weekly | منوی هفتگی |
| GET | /api/v1/menu/date/:date | منوی تاریخ خاص |
| POST | /api/v1/menu/schedule | برنامه‌ریزی منو |
| PUT | /api/v1/menu/schedule/:id | ویرایش برنامه |
| DELETE | /api/v1/menu/schedule/:id | حذف برنامه |

#### Pricing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/menu/items/:id/prices | دریافت قیمت‌ها |
| PUT | /api/v1/menu/items/:id/prices | ویرایش قیمت‌ها |
| POST | /api/v1/menu/items/:id/prices/corporate | قیمت سازمانی |

#### Promotions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/menu/promotions | لیست تخفیف‌ها |
| POST | /api/v1/menu/promotions | ایجاد تخفیف |
| POST | /api/v1/menu/promotions/validate | اعتبارسنجی کد |

### Events Published:
- `menu.daily.published`
- `menu.item.created`
- `menu.item.updated`
- `menu.item.out_of_stock`

### Caching (Redis):
- `menu:today` - TTL: 1 hour
- `menu:weekly` - TTL: 6 hours
- `food:{id}` - TTL: 30 minutes
- `categories:all` - TTL: 1 hour

لطفاً کد کامل این سرویس را ایجاد کن.
```

---

### 8️⃣ Order Service

```markdown
## سرویس شماره 7: Order Service

**Port:** 3006
**Database:** PostgreSQL

### وظایف:
- مدیریت سبد خرید
- ثبت سفارش (شخصی و سازمانی)
- پیگیری وضعیت سفارش
- لغو و ویرایش سفارش
- رزرو هفتگی غذا

### Database Tables:

```sql
-- carts table (سبد خرید)
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- cart_items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id),
    food_id UUID NOT NULL,
    food_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    company_id UUID,
    employee_id UUID,
    order_type VARCHAR(20) NOT NULL, -- 'personal', 'corporate'
    status VARCHAR(20) DEFAULT 'pending',
    
    -- مبالغ
    subtotal DECIMAL(12, 2),
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    subsidy_amount DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2),
    user_payable DECIMAL(12, 2),
    company_payable DECIMAL(12, 2) DEFAULT 0,
    
    -- تحویل
    delivery_date DATE NOT NULL,
    delivery_time_slot TIME,
    delivery_address JSONB,
    delivery_notes TEXT,
    
    -- متادیتا
    promo_code VARCHAR(50),
    notes TEXT,
    
    -- timestamps
    confirmed_at TIMESTAMP,
    preparing_at TIMESTAMP,
    ready_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    food_id UUID NOT NULL,
    food_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(12, 2),
    notes TEXT
);

-- order_status_history table
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    status VARCHAR(20) NOT NULL,
    changed_by UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- weekly_reservations table
CREATE TABLE weekly_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID,
    week_start_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    total_amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- reservation_items table
CREATE TABLE reservation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES weekly_reservations(id),
    date DATE NOT NULL,
    meal_type VARCHAR(20),
    food_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'scheduled'
);
```

### Order Status Flow:
```
PENDING → CONFIRMED → PREPARING → READY → DELIVERED → COMPLETED
    ↓          ↓
CANCELLED  REJECTED
```

### Endpoints:

#### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/orders/cart | مشاهده سبد خرید |
| POST | /api/v1/orders/cart/items | افزودن به سبد |
| PUT | /api/v1/orders/cart/items/:id | ویرایش تعداد |
| DELETE | /api/v1/orders/cart/items/:id | حذف از سبد |
| DELETE | /api/v1/orders/cart | پاک کردن سبد |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/orders | ثبت سفارش |
| GET | /api/v1/orders | لیست سفارشات من |
| GET | /api/v1/orders/:id | جزئیات سفارش |
| PATCH | /api/v1/orders/:id/status | تغییر وضعیت |
| POST | /api/v1/orders/:id/cancel | لغو سفارش |
| POST | /api/v1/orders/:id/reorder | سفارش مجدد |

#### Weekly Reservation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/orders/reservations | ثبت رزرو هفتگی |
| GET | /api/v1/orders/reservations/current | رزرو هفته جاری |
| PUT | /api/v1/orders/reservations/:id | ویرایش رزرو |
| DELETE | /api/v1/orders/reservations/:id/day/:date | حذف یک روز |

#### Kitchen (Staff)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/orders/kitchen/today | سفارشات امروز |
| GET | /api/v1/orders/kitchen/queue | صف آماده‌سازی |
| PATCH | /api/v1/orders/kitchen/:id/status | تغییر وضعیت |
| GET | /api/v1/orders/kitchen/summary | خلاصه تولید |

#### Company Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/orders/company/:companyId | سفارشات شرکت |
| GET | /api/v1/orders/company/:companyId/summary | خلاصه روزانه |
| POST | /api/v1/orders/bulk | سفارش دسته‌ای |

### Order Processing Logic:
```javascript
async function processOrder(orderData) {
  // 1. Validate menu availability
  // 2. Check order deadline
  // 3. Calculate prices (base + corporate discounts)
  // 4. Apply promo code if any
  // 5. If corporate:
  //    - Calculate subsidy from company
  //    - Check employee wallet balance
  //    - Split payment (subsidy + personal)
  // 6. Create order
  // 7. Update inventory
  // 8. Deduct from wallet(s)
  // 9. Publish events
}
```

### Events Published:
- `order.created`
- `order.confirmed`
- `order.preparing`
- `order.ready`
- `order.delivered`
- `order.completed`
- `order.cancelled`

### Events Subscribed:
- `payment.completed` → تایید سفارش
- `payment.failed` → لغو سفارش

### Internal API Calls:
- Menu Service: دریافت اطلاعات غذا و قیمت
- Wallet Service: بررسی موجودی و کسر
- Company Service: دریافت اطلاعات یارانه

لطفاً کد کامل این سرویس را ایجاد کن.
```

---

### 9️⃣ Invoice Service

```markdown
## سرویس شماره 8: Invoice Service

**Port:** 3007
**Database:** PostgreSQL

### وظایف:
- صدور فاکتور (تکی و تجمیعی)
- تولید PDF فاکتور
- ارسال فاکتور به ایمیل
- مدیریت وضعیت پرداخت

### Database Tables:

```sql
-- invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'instant', 'consolidated', 'proforma'
    status VARCHAR(20) DEFAULT 'draft', -- draft, issued, sent, paid, cancelled
    
    user_id UUID,
    company_id UUID,
    
    -- Period (for consolidated)
    period_start DATE,
    period_end DATE,
    
    -- Amounts
    subtotal DECIMAL(15, 2),
    discount DECIMAL(15, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 9,
    tax_amount DECIMAL(15, 2),
    total_amount DECIMAL(15, 2),
    
    -- Payment
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    due_date DATE,
    paid_at TIMESTAMP,
    
    -- Files
    pdf_url VARCHAR(500),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- invoice_items table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    order_id UUID,
    description TEXT NOT NULL,
    quantity INTEGER,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(12, 2)
);
```

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/invoices | لیست فاکتورهای من |
| GET | /api/v1/invoices/:id | جزئیات فاکتور |
| GET | /api/v1/invoices/:id/pdf | دانلود PDF |
| POST | /api/v1/invoices/:id/send | ارسال ایمیل |
| PATCH | /api/v1/invoices/:id/status | تغییر وضعیت |
| GET | /api/v1/invoices/company/:companyId | فاکتورهای شرکت |
| POST | /api/v1/invoices/company/:companyId/generate | صدور فاکتور ماهانه |
| GET | /api/v1/invoices/company/:companyId/preview | پیش‌نمایش |

### PDF Generation:
استفاده از کتابخانه `pdfkit` یا `puppeteer` برای تولید PDF

### Events Published:
- `invoice.created`
- `invoice.sent`
- `invoice.paid`

### Events Subscribed:
- `order.completed` → ایجاد فاکتور

لطفاً کد کامل این سرویس را با قابلیت PDF generation ایجاد کن.
```

---

### 🔟 Payment Service

```markdown
## سرویس شماره 9: Payment Service

**Port:** 3008
**Database:** PostgreSQL

### وظایف:
- درخواست پرداخت
- اتصال به درگاه‌های پرداخت (ZarinPal, IDPay)
- تایید پرداخت
- استرداد وجه

### Database Tables:

```sql
-- payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID,
    invoice_id UUID,
    user_id UUID NOT NULL,
    
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    method VARCHAR(20), -- 'online', 'wallet', 'credit'
    
    gateway VARCHAR(50),
    gateway_ref VARCHAR(100),
    gateway_response JSONB,
    
    tracking_code VARCHAR(50),
    
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(15, 2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/payments/request | درخواست پرداخت |
| GET | /api/v1/payments/verify | تایید پرداخت (callback) |
| POST | /api/v1/payments/verify | تایید پرداخت |
| GET | /api/v1/payments/:id | وضعیت پرداخت |
| GET | /api/v1/payments/history | تاریخچه پرداخت‌ها |
| POST | /api/v1/payments/:id/refund | استرداد |

### Payment Flow:
```
1. POST /payments/request → دریافت URL درگاه
2. Redirect to Gateway
3. Gateway Callback → GET /payments/verify?Authority=xxx
4. Verify with Gateway API
5. Update payment status
6. Publish event
```

### Gateway Integration:
- ZarinPal (mock for development)
- IDPay

### Events Published:
- `payment.initiated`
- `payment.completed`
- `payment.failed`
- `payment.refunded`

لطفاً کد کامل این سرویس را با mock gateway برای تست ایجاد کن.
```

---

### 1️⃣1️⃣ Wallet Service

```markdown
## سرویس شماره 10: Wallet Service

**Port:** 3009
**Database:** PostgreSQL

### وظایف:
- مدیریت کیف پول کاربران
- مدیریت کیف پول شرکت‌ها
- شارژ و کسر موجودی
- مدیریت یارانه
- تاریخچه تراکنش‌ها

### Database Tables:

```sql
-- wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    personal_balance DECIMAL(15, 2) DEFAULT 0,
    company_balance DECIMAL(15, 2) DEFAULT 0,
    company_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- wallet_transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id),
    type VARCHAR(30) NOT NULL,
    balance_type VARCHAR(20) NOT NULL, -- 'personal', 'company'
    amount DECIMAL(12, 2) NOT NULL,
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    reference_type VARCHAR(50),
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- company_wallet_pool table
CREATE TABLE company_wallet_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID UNIQUE NOT NULL,
    total_balance DECIMAL(15, 2) DEFAULT 0,
    allocated_balance DECIMAL(15, 2) DEFAULT 0,
    available_balance DECIMAL(15, 2) DEFAULT 0,
    monthly_budget DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transaction Types:
- `topup_personal` - شارژ شخصی
- `topup_company` - شارژ توسط شرکت
- `subsidy_allocation` - تخصیص یارانه
- `order_payment` - پرداخت سفارش
- `order_refund` - استرداد سفارش
- `subsidy_expiry` - انقضای یارانه
- `withdrawal` - برداشت

### Endpoints:

#### User Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/wallets/balance | موجودی |
| GET | /api/v1/wallets/transactions | تاریخچه |
| POST | /api/v1/wallets/topup | شارژ شخصی |

#### Company Wallet Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/wallets/company/:id | کیف پول شرکت |
| POST | /api/v1/wallets/company/:id/topup | شارژ شرکت |
| POST | /api/v1/wallets/company/:id/allocate | توزیع بین کارمندان |
| GET | /api/v1/wallets/company/:id/employees | موجودی کارمندان |

#### Internal APIs (gRPC/HTTP)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /internal/deduct | کسر موجودی |
| POST | /internal/refund | استرداد |
| GET | /internal/check-balance | بررسی موجودی |

### Events Published:
- `wallet.charged`
- `wallet.debited`
- `wallet.low_balance`

### Events Subscribed:
- `order.created` → کسر موجودی
- `order.cancelled` → استرداد
- `employee.added` → ایجاد کیف پول

لطفاً کد کامل این سرویس را ایجاد کن.
```

---

### 1️⃣2️⃣ Notification Service

```markdown
## سرویس شماره 11: Notification Service

**Port:** 3010
**Database:** MongoDB

### وظایف:
- ارسال ایمیل
- ارسال SMS
- مدیریت اعلان‌های In-App
- مدیریت تنظیمات اعلان کاربران

### Database Collections:

```javascript
// notifications collection
{
  _id: ObjectId,
  userId: String,
  type: 'email' | 'sms' | 'push' | 'in_app',
  category: String,
  title: String,
  body: String,
  data: Object,
  status: 'pending' | 'sent' | 'failed' | 'read',
  readAt: Date,
  sentAt: Date,
  error: String,
  createdAt: Date
}

// notification_templates collection
{
  _id: ObjectId,
  name: String,
  type: 'email' | 'sms',
  subject: String,
  body: String,
  variables: [String],
  isActive: Boolean
}
```

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/notifications | لیست اعلان‌ها |
| PATCH | /api/v1/notifications/:id/read | خوانده شد |
| PATCH | /api/v1/notifications/read-all | همه خوانده شد |
| GET | /api/v1/notifications/unread-count | تعداد خوانده نشده |
| PUT | /api/v1/notifications/preferences | تنظیمات |
| POST | /api/v1/notifications/send | ارسال (admin) |

### Events Subscribed:
- `order.created` → اعلان به کاربر
- `order.confirmed` → اعلان به کاربر
- `order.ready` → اعلان به کاربر
- `company.approved` → ایمیل به مدیر شرکت
- `payment.completed` → اعلان به کاربر
- `wallet.low_balance` → اعلان به کاربر

### Email Provider:
- Nodemailer (با mock SMTP برای development)

### SMS Provider:
- Mock SMS provider

لطفاً کد کامل این سرویس را ایجاد کن.
```

---

### 1️⃣3️⃣ Reporting Service

```markdown
## سرویس شماره 12: Reporting Service

**Port:** 3011
**Database:** PostgreSQL (Read Replica) + Redis

### وظایف:
- گزارش سفارشات روزانه/ماهانه
- گزارش مصرف شرکت‌ها
- گزارش درآمد
- داشبورد مدیریتی
- خروجی Excel

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/reports/dashboard | داشبورد |
| GET | /api/v1/reports/orders/daily | گزارش روزانه |
| GET | /api/v1/reports/orders/monthly | گزارش ماهانه |
| GET | /api/v1/reports/revenue | گزارش درآمد |
| GET | /api/v1/reports/company/:id/consumption | مصرف شرکت |
| GET | /api/v1/reports/popular-items | غذاهای پرطرفدار |
| GET | /api/v1/reports/export | خروجی Excel |

### Caching:
- Dashboard data: 5 minutes
- Daily reports: 1 hour
- Monthly reports: 6 hours

لطفاً کد کامل این سرویس را ایجاد کن.
```

---

### 1️⃣4️⃣ File Service

```markdown
## سرویس شماره 13: File Service

**Port:** 3012
**Storage:** MinIO

### وظایف:
- آپلود فایل
- مدیریت تصاویر
- Resize تصاویر
- تولید URL

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/files/upload | آپلود تکی |
| POST | /api/v1/files/bulk-upload | آپلود دسته‌ای |
| GET | /api/v1/files/:id | دانلود فایل |
| DELETE | /api/v1/files/:id | حذف فایل |
| GET | /api/v1/files/:id/thumbnail | تصویر کوچک |

### Features:
- Image resize با Sharp
- فرمت‌های مجاز: jpg, png, pdf, xlsx
- حداکثر سایز: 10MB

لطفاً کد کامل این سرویس را با MinIO integration ایجاد کن.
```

---

## 📦 Docker Compose

```markdown
## آخرین مرحله: Docker Compose

لطفاً فایل `docker-compose.yml` کامل ایجاد کن که شامل:

1. **Infrastructure:**
   - PostgreSQL
   - MongoDB
   - Redis
   - RabbitMQ
   - MinIO

2. **Services:**
   - تمام 13 سرویس

3. **Networks:**
   - شبکه داخلی برای ارتباط سرویس‌ها

4. **Volumes:**
   - Persistent storage برای databases

همچنین فایل `docker-compose.dev.yml` برای development با hot-reload ایجاد کن.
```

---

## 📬 Postman Collection

```markdown
## Postman Collection

لطفاً یک Postman Collection کامل ایجاد کن که شامل:

1. **Environment Variables:**
   - `base_url`: http://localhost:3000
   - `access_token`: (auto-set after login)
   - `refresh_token`: (auto-set after login)

2. **Folders:**
   - Auth
   - Identity
   - Users
   - Companies
   - Menu
   - Orders
   - Invoices
   - Payments
   - Wallets
   - Notifications
   - Reports
   - Files

3. **Pre-request Scripts:**
   - Auto refresh token if expired

4. **Tests:**
   - Status code validation
   - Response structure validation

خروجی به صورت JSON قابل import در Postman باشد.
```

---

## 🔄 دستور استفاده

برای استفاده از این پرامپت‌ها:

1. **ابتدا** پرامپت اصلی را به Kiro بده
2. **سپس** به ترتیب هر سرویس را درخواست کن
3. **بعد از هر سرویس** کد را تست کن و سپس سرویس بعدی را درخواست کن
4. **در نهایت** Docker Compose و Postman Collection را درخواست کن

### نکات مهم:
- بین هر درخواست، کد را بررسی و تست کن
- اگر خطایی داشت، از Kiro بخواه اصلاح کند
- می‌توانی بگویی "سرویس X را با جزئیات بیشتر بنویس"