# 📁 File Service

سرویس مدیریت فایل سیستم کترینگ سازمانی

## 🎯 وظایف

- آپلود فایل (تکی و دسته‌ای)
- مدیریت تصاویر
- تغییر اندازه و بهینه‌سازی تصاویر
- تولید تامبنیل خودکار
- ذخیره‌سازی در MinIO (S3 compatible)
- URL امضا شده برای فایل‌های خصوصی

## 🔧 تنظیمات

### متغیرهای محیطی

```env
NODE_ENV=development
PORT=3012
SERVICE_NAME=file-service

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=file_db
DB_USER=catering_user
DB_PASSWORD=catering_pass_123

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=catering-files

# JWT
JWT_SECRET=your-secret-key

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,pdf,xlsx

# Thumbnail
THUMBNAIL_WIDTH=200
THUMBNAIL_HEIGHT=200
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
docker build -t file-service .
docker run -p 3012:3012 file-service
```

## 📚 API Endpoints

| Method | Endpoint | توضیحات |
|--------|----------|---------|
| POST | /api/v1/files/upload | آپلود فایل |
| POST | /api/v1/files/bulk-upload | آپلود دسته‌ای |
| GET | /api/v1/files/:id | دانلود فایل |
| GET | /api/v1/files/:id/info | اطلاعات فایل |
| GET | /api/v1/files/:id/url | دریافت URL فایل |
| GET | /api/v1/files/:id/thumbnail | تصویر بندانگشتی |
| DELETE | /api/v1/files/:id | حذف فایل |
| GET | /api/v1/files | لیست فایل‌های کاربر |
| GET | /health | بررسی سلامت سرویس |

## 📖 مستندات API

مستندات Swagger در آدرس زیر در دسترس است:

```
http://localhost:3012/api-docs
```

## 📋 فرمت‌های مجاز

| فرمت | نوع |
|------|-----|
| jpg, jpeg | تصویر |
| png | تصویر |
| pdf | سند |
| xlsx | صفحه گسترده |

## 📏 محدودیت‌ها

- حداکثر حجم فایل: **۱۰ مگابایت**
- حداکثر تعداد فایل در آپلود دسته‌ای: **۱۰ فایل**

## 🖼️ پردازش تصاویر

- بهینه‌سازی خودکار تصاویر
- تولید تامبنیل (۲۰۰×۲۰۰ پیکسل)
- استخراج متادیتا (ابعاد، فرمت، ...)

## 🗄️ MinIO

سرویس از MinIO به عنوان ذخیره‌ساز S3-compatible استفاده می‌کند:

- فایل‌های عمومی: دسترسی مستقیم
- فایل‌های خصوصی: URL امضا شده با انقضا

## 🔐 امنیت

- اعتبارسنجی فرمت فایل
- محدودیت حجم فایل
- URL امضا شده برای فایل‌های خصوصی
- ذخیره متادیتا در دیتابیس
