# 📊 Reporting Service

سرویس گزارشات سیستم کترینگ سازمانی

## 🎯 وظایف

- داشبورد مدیریتی
- گزارش سفارشات روزانه
- گزارش سفارشات ماهانه
- گزارش درآمد
- گزارش مصرف شرکت‌ها
- غذاهای پرطرفدار
- خروجی Excel

## 🔧 تنظیمات

### متغیرهای محیطی

```env
NODE_ENV=development
PORT=3011
SERVICE_NAME=reporting-service

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reporting_db
DB_USER=catering_user
DB_PASSWORD=catering_pass_123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_pass_123

# JWT
JWT_SECRET=your-secret-key

# Cache TTL (seconds)
CACHE_TTL_DASHBOARD=300
CACHE_TTL_DAILY=3600
CACHE_TTL_MONTHLY=21600
```

## 🚀 راه‌اندازی

### نصب وابستگی‌ها

```bash
npm install
```

### اجرای سرویس

```bash
# Development
npm run dev

# Production
npm start
```

### Docker

```bash
docker build -t reporting-service .
docker run -p 3011:3011 reporting-service
```

## 📚 API Endpoints

| Method | Endpoint | توضیحات |
|--------|----------|---------|
| GET | /api/v1/reports/dashboard | داشبورد مدیریتی |
| GET | /api/v1/reports/orders/daily | گزارش سفارشات روزانه |
| GET | /api/v1/reports/orders/monthly | گزارش سفارشات ماهانه |
| GET | /api/v1/reports/revenue | گزارش درآمد |
| GET | /api/v1/reports/company/:id/consumption | گزارش مصرف شرکت |
| GET | /api/v1/reports/popular-items | غذاهای پرطرفدار |
| GET | /api/v1/reports/export | خروجی Excel |
| GET | /health | بررسی سلامت سرویس |

## 📖 مستندات API

مستندات Swagger در آدرس زیر در دسترس است:

```
http://localhost:3011/api-docs
```

## 🗄️ کش (Redis)

| کلید | TTL |
|------|-----|
| reports:dashboard | ۵ دقیقه |
| reports:daily:* | ۱ ساعت |
| reports:monthly:* | ۶ ساعت |

## 🔐 دسترسی‌ها

- **داشبورد**: فقط ادمین
- **گزارشات روزانه/ماهانه**: فقط ادمین
- **گزارش درآمد**: فقط ادمین
- **گزارش مصرف شرکت**: ادمین یا مدیر شرکت مربوطه
- **غذاهای پرطرفدار**: فقط ادمین
- **خروجی Excel**: ادمین یا مدیر شرکت

## 📊 خروجی Excel

گزارشات با ستون‌های فارسی و فرمت مناسب برای کاربران ایرانی تولید می‌شوند:

- تاریخ شمسی
- اعداد فارسی
- قیمت با فرمت تومان
- راست به چپ (RTL)
