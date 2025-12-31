# سرویس سفارشات (Order Service)

سرویس مدیریت سفارشات، سبد خرید و رزرو هفتگی برای سیستم کترینگ.

## ویژگی‌ها

- مدیریت سبد خرید
- ثبت و پیگیری سفارشات
- رزرو هفتگی غذا
- مدیریت صف آشپزخانه
- سفارشات سازمانی و گروهی
- محاسبه قیمت و یارانه

## پیش‌نیازها

- Node.js v18+
- PostgreSQL
- RabbitMQ

## نصب و راه‌اندازی

```bash
# نصب وابستگی‌ها
npm install

# کپی فایل تنظیمات
cp .env.example .env

# اجرا در محیط توسعه
npm run dev

# اجرا در محیط تولید
npm start
```

## متغیرهای محیطی

| متغیر | توضیحات | مقدار پیش‌فرض |
|-------|---------|---------------|
| PORT | پورت سرویس | 3006 |
| DB_HOST | هاست PostgreSQL | localhost |
| DB_PORT | پورت PostgreSQL | 5432 |
| DB_NAME | نام دیتابیس | order_db |
| RABBITMQ_URL | آدرس RabbitMQ | amqp://localhost:5672 |

## API Endpoints

### سبد خرید
- `GET /api/v1/orders/cart` - دریافت سبد خرید
- `POST /api/v1/orders/cart/items` - افزودن آیتم
- `PUT /api/v1/orders/cart/items/:id` - ویرایش آیتم
- `DELETE /api/v1/orders/cart/items/:id` - حذف آیتم
- `DELETE /api/v1/orders/cart` - خالی کردن سبد

### سفارشات
- `POST /api/v1/orders` - ثبت سفارش
- `GET /api/v1/orders` - لیست سفارشات
- `GET /api/v1/orders/:id` - جزئیات سفارش
- `PATCH /api/v1/orders/:id/status` - تغییر وضعیت
- `POST /api/v1/orders/:id/cancel` - لغو سفارش
- `POST /api/v1/orders/:id/reorder` - سفارش مجدد

### رزرو هفتگی
- `POST /api/v1/orders/reservations` - ایجاد رزرو
- `GET /api/v1/orders/reservations/current` - رزرو جاری
- `PUT /api/v1/orders/reservations/:id` - ویرایش رزرو
- `DELETE /api/v1/orders/reservations/:id/day/:date` - لغو یک روز

### آشپزخانه
- `GET /api/v1/orders/kitchen/today` - سفارشات امروز
- `GET /api/v1/orders/kitchen/queue` - صف سفارشات
- `GET /api/v1/orders/kitchen/summary` - خلاصه

### سفارشات شرکت
- `GET /api/v1/orders/company/:companyId` - سفارشات شرکت
- `GET /api/v1/orders/company/:companyId/summary` - خلاصه
- `POST /api/v1/orders/bulk` - سفارش گروهی

## وضعیت‌های سفارش

```
PENDING → CONFIRMED → PREPARING → READY → DELIVERED → COMPLETED
   ↓          ↓
CANCELLED  REJECTED
```

## رویدادها

### منتشر شده
- `order.created` - ایجاد سفارش
- `order.confirmed` - تأیید سفارش
- `order.preparing` - شروع آماده‌سازی
- `order.ready` - آماده تحویل
- `order.delivered` - تحویل داده شده
- `order.completed` - تکمیل شده
- `order.cancelled` - لغو شده

### دریافتی
- `payment.completed` - تأیید سفارش پس از پرداخت
- `payment.failed` - لغو سفارش پس از پرداخت ناموفق

## مستندات API

```
http://localhost:3006/api-docs
```

## Health Check

```
GET http://localhost:3006/health
```
