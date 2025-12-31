# سرویس منو (Menu Service)

سرویس مدیریت منو، غذاها، دسته‌بندی‌ها و برنامه‌ریزی روزانه برای سیستم کترینگ.

## ویژگی‌ها

- مدیریت دسته‌بندی‌های غذا (سلسله‌مراتبی)
- مدیریت آیتم‌های غذا با قیمت‌گذاری پویا
- برنامه‌ریزی منوی روزانه و هفتگی
- سیستم تخفیف و پروموشن
- کش با Redis برای عملکرد بالا
- انتشار رویدادها با RabbitMQ

## پیش‌نیازها

- Node.js v18+
- MongoDB
- Redis
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

# اجرای تست‌ها
npm test
```

## متغیرهای محیطی

| متغیر | توضیحات | مقدار پیش‌فرض |
|-------|---------|---------------|
| PORT | پورت سرویس | 3005 |
| MONGODB_URI | آدرس MongoDB | mongodb://localhost:27017/menu_db |
| REDIS_HOST | هاست Redis | localhost |
| REDIS_PORT | پورت Redis | 6379 |
| RABBITMQ_URL | آدرس RabbitMQ | amqp://localhost:5672 |

## API Endpoints

### دسته‌بندی‌ها
- `GET /api/v1/menu/categories` - لیست دسته‌بندی‌ها
- `POST /api/v1/menu/categories` - ایجاد دسته‌بندی
- `GET /api/v1/menu/categories/:id` - دریافت دسته‌بندی
- `PUT /api/v1/menu/categories/:id` - ویرایش دسته‌بندی
- `DELETE /api/v1/menu/categories/:id` - حذف دسته‌بندی

### غذاها
- `GET /api/v1/menu/items` - لیست غذاها
- `POST /api/v1/menu/items` - ایجاد غذا
- `GET /api/v1/menu/items/:id` - دریافت غذا
- `PUT /api/v1/menu/items/:id` - ویرایش غذا
- `DELETE /api/v1/menu/items/:id` - حذف غذا
- `GET /api/v1/menu/items/popular` - غذاهای محبوب
- `GET /api/v1/menu/items/:id/nutrition` - اطلاعات تغذیه‌ای

### برنامه غذایی
- `GET /api/v1/menu/daily` - منوی امروز
- `GET /api/v1/menu/weekly` - منوی هفتگی
- `GET /api/v1/menu/date/:date` - منوی تاریخ خاص
- `POST /api/v1/menu/schedule` - ایجاد برنامه غذایی

### تخفیف‌ها
- `GET /api/v1/menu/promotions` - لیست تخفیف‌ها
- `POST /api/v1/menu/promotions` - ایجاد تخفیف
- `POST /api/v1/menu/promotions/validate` - اعتبارسنجی کد تخفیف

## رویدادهای منتشر شده

- `menu.daily.published` - انتشار منوی روزانه
- `menu.item.created` - ایجاد غذای جدید
- `menu.item.updated` - ویرایش غذا
- `menu.item.out_of_stock` - اتمام موجودی غذا

## کش (Redis)

| کلید | TTL |
|------|-----|
| menu:today | 1 ساعت |
| menu:weekly | 6 ساعت |
| food:{id} | 30 دقیقه |
| categories:all | 1 ساعت |

## مستندات API

مستندات Swagger در آدرس زیر در دسترس است:
```
http://localhost:3005/api-docs
```

## Health Check

```
GET http://localhost:3005/health
```

## Docker

```bash
# ساخت ایمیج
docker build -t menu-service .

# اجرا
docker run -p 3005:3005 --env-file .env menu-service
```
