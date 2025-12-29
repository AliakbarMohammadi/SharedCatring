# Identity Service - سرویس هویت

سرویس مدیریت کاربران، نقش‌ها و دسترسی‌ها در سیستم کترینگ سازمانی.

## 🎯 مسئولیت‌ها

- مدیریت کاربران (CRUD)
- مدیریت نقش‌ها
- مدیریت دسترسی‌ها
- تخصیص نقش به کاربران
- کنترل دسترسی مبتنی بر نقش (RBAC)

## 🚀 راه‌اندازی

```bash
# نصب وابستگی‌ها
npm install

# اجرا در محیط توسعه
npm run dev

# اجرا در محیط تولید
npm start

# اجرای تست‌ها
npm test
```

## 📡 API Endpoints

| Method | Endpoint | توضیحات |
|--------|----------|---------|
| POST | /api/v1/identity/users | ایجاد کاربر |
| GET | /api/v1/identity/users | لیست کاربران |
| GET | /api/v1/identity/users/:id | دریافت کاربر |
| PUT | /api/v1/identity/users/:id | ویرایش کاربر |
| DELETE | /api/v1/identity/users/:id | حذف کاربر |
| PATCH | /api/v1/identity/users/:id/status | تغییر وضعیت |
| POST | /api/v1/identity/users/:id/assign-role | تخصیص نقش |
| GET | /api/v1/identity/roles | لیست نقش‌ها |
| POST | /api/v1/identity/roles | ایجاد نقش |
| GET | /api/v1/identity/permissions | لیست دسترسی‌ها |
| GET | /health | بررسی سلامت |

## 📚 مستندات

- Swagger UI: http://localhost:3002/api-docs

## 🔑 نقش‌های پیش‌فرض

- `super_admin` - مدیر ارشد سیستم
- `catering_admin` - مدیر کترینگ
- `kitchen_staff` - پرسنل آشپزخانه
- `company_admin` - مدیر شرکت
- `company_manager` - مدیر واحد شرکت
- `employee` - کارمند شرکت
- `personal_user` - کاربر شخصی

## 📢 رویدادها (RabbitMQ)

- `identity.user.created`
- `identity.user.updated`
- `identity.user.deleted`
- `identity.role.assigned`
