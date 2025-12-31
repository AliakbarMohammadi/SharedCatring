# سرویس پرداخت (Payment Service)

سرویس مدیریت پرداخت‌ها و اتصال به درگاه‌های بانکی

## پورت
- **3008**

## پایگاه داده
- PostgreSQL

## قابلیت‌ها
- ایجاد درخواست پرداخت
- اتصال به درگاه زرین‌پال
- اتصال به درگاه آیدی‌پی
- تایید پرداخت
- استرداد وجه
- پیگیری با کد رهگیری

## API Endpoints

| متد | مسیر | توضیحات |
|-----|------|---------|
| POST | /api/v1/payments/request | ایجاد پرداخت |
| GET | /api/v1/payments/verify | callback درگاه |
| POST | /api/v1/payments/verify | تایید پرداخت |
| GET | /api/v1/payments/:id | وضعیت پرداخت |
| GET | /api/v1/payments/history | تاریخچه |
| GET | /api/v1/payments/tracking/:code | پیگیری |
| POST | /api/v1/payments/:id/refund | استرداد |

## وضعیت‌های پرداخت
- `pending` - در انتظار پرداخت
- `processing` - در حال پردازش
- `completed` - پرداخت شده
- `failed` - ناموفق
- `refunded` - مسترد شده

## رویدادها

### منتشر شده
- `payment.initiated` - پرداخت ایجاد شد
- `payment.completed` - پرداخت موفق
- `payment.failed` - پرداخت ناموفق
- `payment.refunded` - استرداد شد

## اجرا

```bash
npm install
npm run dev
```

## مستندات
- Swagger: http://localhost:3008/api-docs
- Health: http://localhost:3008/health
