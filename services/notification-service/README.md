# سرویس اعلان‌ها (Notification Service)

سرویس مدیریت اعلان‌ها، ایمیل و پیامک

## پورت
- **3010**

## پایگاه داده
- MongoDB

## قابلیت‌ها
- ارسال ایمیل (با قالب HTML فارسی)
- ارسال پیامک (Mock Provider)
- اعلان‌های درون‌برنامه‌ای
- مدیریت تنظیمات اعلان کاربران
- قالب‌های آماده برای ایمیل و پیامک
- دریافت رویداد از سایر سرویس‌ها

## API Endpoints

| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | /api/v1/notifications | لیست اعلان‌های کاربر |
| GET | /api/v1/notifications/unread-count | تعداد خوانده نشده |
| PATCH | /api/v1/notifications/:id/read | علامت خوانده شده |
| PATCH | /api/v1/notifications/read-all | خواندن همه |
| GET | /api/v1/notifications/preferences | تنظیمات اعلان |
| PUT | /api/v1/notifications/preferences | به‌روزرسانی تنظیمات |
| POST | /api/v1/notifications/send | ارسال دستی (ادمین) |

## رویدادهای دریافتی
- `order.created` - ثبت سفارش
- `order.confirmed` - تایید سفارش
- `order.ready` - آماده تحویل
- `order.delivered` - تحویل داده شده
- `payment.completed` - پرداخت موفق
- `company.approved` - تایید شرکت
- `wallet.low_balance` - موجودی کم
- `wallet.charged` - شارژ کیف پول

## قالب‌های آماده
- `order_created` - ایمیل ثبت سفارش
- `order_confirmed` - ایمیل تایید سفارش
- `company_approved` - ایمیل تایید شرکت
- `order_created_sms` - پیامک ثبت سفارش
- `order_ready_sms` - پیامک آماده تحویل
- `otp_sms` - پیامک کد تایید

## اجرا

```bash
npm install
npm run seed  # بارگذاری قالب‌ها
npm run dev
```

## مستندات
- Swagger: http://localhost:3010/api-docs
- Health: http://localhost:3010/health
