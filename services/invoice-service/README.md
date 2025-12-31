# سرویس فاکتور (Invoice Service)

سرویس مدیریت فاکتورها برای سیستم کترینگ سازمانی

## پورت
- **3007**

## پایگاه داده
- PostgreSQL

## قابلیت‌ها
- ایجاد فاکتور فوری (از سفارش)
- ایجاد فاکتور تجمیعی (برای شرکت‌ها)
- تولید PDF فاکتور با پشتیبانی از تاریخ شمسی
- ارسال فاکتور از طریق ایمیل
- مدیریت وضعیت فاکتور
- شماره‌گذاری خودکار فاکتور (INV-YYMM-XXXX)
- محاسبه مالیات (پیش‌فرض ۹٪)

## API Endpoints

### فاکتورها
| متد | مسیر | توضیحات |
|-----|------|---------|
| POST | /api/v1/invoices | ایجاد فاکتور جدید |
| GET | /api/v1/invoices | لیست فاکتورهای کاربر |
| GET | /api/v1/invoices/:id | دریافت جزئیات فاکتور |
| GET | /api/v1/invoices/number/:invoiceNumber | دریافت فاکتور با شماره |
| PATCH | /api/v1/invoices/:id/status | تغییر وضعیت فاکتور |
| GET | /api/v1/invoices/:id/pdf | دریافت لینک PDF |
| GET | /api/v1/invoices/:id/download | دانلود PDF |
| POST | /api/v1/invoices/:id/send | ارسال فاکتور به ایمیل |

### فاکتورهای شرکت
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | /api/v1/invoices/company/:companyId | لیست فاکتورهای شرکت |
| POST | /api/v1/invoices/company/consolidated/preview | پیش‌نمایش فاکتور تجمیعی |
| POST | /api/v1/invoices/company/consolidated | ایجاد فاکتور تجمیعی |

## وضعیت‌های فاکتور
```
draft → issued → sent → paid
         ↓
      cancelled
```

## رویدادها

### منتشر شده
- `invoice.created` - فاکتور ایجاد شد
- `invoice.paid` - فاکتور پرداخت شد
- `invoice.sent` - فاکتور ارسال شد

### دریافتی
- `order.completed` - ایجاد فاکتور از سفارش
- `payment.completed` - تغییر وضعیت به پرداخت شده

## متغیرهای محیطی
```env
PORT=3007
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=invoice_db
DB_USER=catering_user
DB_PASSWORD=catering_pass_123

# RabbitMQ
RABBITMQ_URL=amqp://catering_user:rabbitmq_pass_123@localhost:5672

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=سیستم کترینگ <noreply@example.com>

# Storage
STORAGE_PATH=./storage/invoices
BASE_URL=http://localhost:3007

# Tax
DEFAULT_TAX_RATE=9

# Currency
CURRENCY=تومان
CURRENCY_CODE=IRR
```

## اجرا

### توسعه
```bash
npm install
npm run dev
```

### تولید
```bash
npm start
```

### Docker
```bash
docker build -t invoice-service .
docker run -p 3007:3007 invoice-service
```

## مستندات API
- Swagger UI: http://localhost:3007/api-docs
- Health Check: http://localhost:3007/health
