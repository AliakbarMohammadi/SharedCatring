# سرویس کیف پول (Wallet Service)

سرویس مدیریت کیف پول کاربران و شرکت‌ها

## پورت
- **3009**

## پایگاه داده
- PostgreSQL

## قابلیت‌ها
- کیف پول شخصی کاربران
- کیف پول سازمانی (یارانه)
- شارژ کیف پول
- کسر موجودی
- استرداد وجه
- تخصیص یارانه به کارمندان
- تاریخچه تراکنش‌ها

## API Endpoints

### کیف پول کاربر
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | /api/v1/wallets/balance | موجودی کیف پول |
| GET | /api/v1/wallets/transactions | تاریخچه تراکنش‌ها |
| POST | /api/v1/wallets/topup | شارژ کیف پول |

### کیف پول شرکت
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | /api/v1/wallets/company/:id | اطلاعات حساب شرکت |
| POST | /api/v1/wallets/company/:id/topup | شارژ حساب شرکت |
| POST | /api/v1/wallets/company/:id/allocate | تخصیص یارانه |
| GET | /api/v1/wallets/company/:id/employees | لیست کیف پول کارمندان |

### API داخلی
| متد | مسیر | توضیحات |
|-----|------|---------|
| POST | /internal/deduct | کسر از کیف پول |
| POST | /internal/refund | برگشت به کیف پول |
| POST | /internal/check-balance | بررسی موجودی |

## انواع تراکنش
- `topup_personal` - شارژ شخصی
- `topup_company` - شارژ سازمانی
- `subsidy_allocation` - تخصیص یارانه
- `order_payment` - پرداخت سفارش
- `order_refund` - استرداد سفارش
- `subsidy_expiry` - انقضای یارانه
- `withdrawal` - برداشت

## رویدادها

### منتشر شده
- `wallet.charged` - کیف پول شارژ شد
- `wallet.debited` - از کیف پول کسر شد
- `wallet.low_balance` - موجودی کم

### دریافتی
- `order.created` - کسر موجودی
- `order.cancelled` - استرداد
- `employee.added` - ایجاد کیف پول
- `payment.completed` - شارژ کیف پول

## اجرا

```bash
npm install
npm run dev
```

## مستندات
- Swagger: http://localhost:3009/api-docs
- Health: http://localhost:3009/health
