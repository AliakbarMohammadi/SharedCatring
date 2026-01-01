# گزارش آمادگی تولید - سیستم کترینگ سازمانی
# Production Readiness Report - Enterprise Catering System

تاریخ: ۱۴۰۴/۱۰/۱۲ (2026-01-01)

---

## ۱. خلاصه تغییرات انجام شده

### حذف کدهای Mock

| سرویس | فایل | تغییرات |
|-------|------|---------|
| auth-service | `auth.controller.js` | حذف `mockUsers` و استفاده از Identity Service واقعی |
| auth-service | `serviceClient.js` | بهبود ارتباط با Identity Service |
| notification-service | `sms.service.js` | حذف حالت mock و پشتیبانی از ارائه‌دهندگان واقعی (کاوه‌نگار، ملی‌پیامک، قاصدک) |
| notification-service | `email.service.js` | حذف شرط development و استفاده از SMTP واقعی |
| notification-service | `notification.service.js` | حذف `simulated: true` از push notifications |
| reporting-service | `report.repository.js` | حذف تمام توابع `getMock*` و استفاده از داده‌های واقعی |
| payment-service | `zarinpal.gateway.js` | حذف mock responses و استفاده از API واقعی زرین‌پال |
| invoice-service | `email.service.js` | حذف شرط development و استفاده از SMTP واقعی |

---

## ۲. یکپارچگی سرویس‌ها

### ارتباطات HTTP

```
Auth Service ──────► Identity Service (ایجاد/احراز هویت کاربر)
Order Service ─────► Menu Service (دریافت اطلاعات غذا)
Order Service ─────► Wallet Service (بررسی موجودی)
Order Service ─────► Company Service (اطلاعات یارانه)
Invoice Service ───► Order Service (اطلاعات سفارش)
Invoice Service ───► Company Service (اطلاعات شرکت)
```

### ارتباطات Event Bus (RabbitMQ)

```
order.created ────► Wallet Service (کسر موجودی)
                ├─► Notification Service (اعلان)
                
order.cancelled ──► Wallet Service (استرداد)
                ├─► Notification Service (اعلان)
                
payment.completed ► Order Service (تایید سفارش)
                ├─► Wallet Service (شارژ کیف پول)
                ├─► Invoice Service (صدور فاکتور)
                ├─► Notification Service (اعلان)
                
employee.added ───► Wallet Service (ایجاد کیف پول)
                ├─► Notification Service (اعلان)
```

---

## ۳. تنظیمات محیطی

### متغیرهای محیطی تولید (`.env.production`)

- ✅ `NODE_ENV=production`
- ✅ `ENABLE_MOCK_PAYMENTS=false`
- ✅ `ENABLE_MOCK_SMS=false`
- ✅ `ENABLE_MOCK_EMAIL=false`
- ✅ `ZARINPAL_SANDBOX=false`
- ✅ `SMS_PROVIDER=kavenegar`

### Service Discovery (Docker)

همه سرویس‌ها از نام‌های Docker استفاده می‌کنند:
- `http://auth-service:3001`
- `http://identity-service:3002`
- `http://order-service:3006`
- و غیره...

---

## ۴. اسکریپت‌های ایجاد شده

| اسکریپت | توضیحات |
|---------|---------|
| `scripts/seed-production-data.js` | ایجاد داده‌های اولیه واقعی (کاربران، شرکت، منو) |
| `scripts/e2e-real-flow-test.js` | تست جریان کامل واقعی از ثبت‌نام تا تحویل |
| `scripts/production-readiness-check.js` | بررسی آمادگی تولید |

---

## ۵. داده‌های اولیه

### کاربران

| نوع | ایمیل | رمز عبور |
|-----|-------|----------|
| کاربر عادی | ali.mohammadi@example.com | Ali@123456 |
| کاربر سازمانی | maryam.hosseini@testcompany.ir | Maryam@123456 |
| مدیر شرکت | admin@testcompany.ir | Admin@123456 |

### شرکت

- نام: شرکت فناوری آینده
- کد ملی: 10320654789
- یارانه روزانه: ۵۰۰,۰۰۰ تومان
- بودجه ماهانه: ۲۵,۰۰۰,۰۰۰ تومان

### منو

- ۴ دسته‌بندی (غذای اصلی، پیش‌غذا، نوشیدنی، دسر)
- ۱۹ آیتم غذا با قیمت‌گذاری واقعی
- منوی روزانه و هفتگی

---

## ۶. جریان کامل کاربر

```
۱. ثبت‌نام ──► Identity Service (ذخیره در PostgreSQL)
     │
۲. ورود ────► Auth Service (تولید JWT)
     │
۳. مشاهده منو ► Menu Service (MongoDB)
     │
۴. شارژ کیف پول ► Payment Service ──► ZarinPal Gateway
     │
۵. ثبت سفارش ► Order Service
     │         ├─► بررسی موجودی (Wallet Service)
     │         ├─► کسر از کیف پول
     │         └─► ارسال event
     │
۶. پرداخت ──► Payment Service ──► تایید از درگاه
     │
۷. تایید سفارش ► Order Service (event: payment.completed)
     │
۸. صدور فاکتور ► Invoice Service (event: order.confirmed)
     │
۹. ارسال اعلان ► Notification Service
     │           ├─► ایمیل (SMTP)
     │           ├─► پیامک (کاوه‌نگار)
     │           └─► اعلان درون‌برنامه‌ای
     │
۱۰. گزارش‌گیری ► Reporting Service (داده‌های واقعی)
```

---

## ۷. چک‌لیست نهایی

- [x] حذف تمام کدهای Mock
- [x] یکپارچگی واقعی سرویس‌ها
- [x] پیام‌های خطای فارسی
- [x] Health Endpoints برای همه سرویس‌ها
- [x] Event Bus (RabbitMQ) فعال
- [x] تنظیمات Docker صحیح
- [x] متغیرهای محیطی تولید
- [x] درگاه پرداخت واقعی (زرین‌پال)
- [x] ارائه‌دهنده پیامک واقعی
- [x] SMTP برای ایمیل

---

## ۸. دستورات اجرا

### راه‌اندازی سیستم

```bash
# با Docker Compose
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

# بررسی سلامت سرویس‌ها
docker-compose -f docker-compose.production.yml ps

# مشاهده لاگ‌ها
docker-compose -f docker-compose.production.yml logs -f
```

### ایجاد داده‌های اولیه

```bash
node scripts/seed-production-data.js
```

### اجرای تست‌های یکپارچگی

```bash
node scripts/e2e-real-flow-test.js
```

### بررسی آمادگی تولید

```bash
node scripts/production-readiness-check.js
```

---

## ۹. نکات مهم

1. **درگاه پرداخت**: قبل از استفاده، `ZARINPAL_MERCHANT_ID` را تنظیم کنید
2. **پیامک**: کلید API کاوه‌نگار را در `SMS_API_KEY` قرار دهید
3. **ایمیل**: تنظیمات SMTP را برای ارسال واقعی ایمیل پیکربندی کنید
4. **امنیت**: رمزهای عبور در `.env.production` را تغییر دهید

---

## ۱۰. نتیجه‌گیری

✅ **سیستم آماده تولید است**

تمام mock ها حذف شده و سرویس‌ها به صورت واقعی با یکدیگر ارتباط برقرار می‌کنند.
