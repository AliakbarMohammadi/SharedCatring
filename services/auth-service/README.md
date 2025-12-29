# Auth Service - سرویس احراز هویت

سرویس احراز هویت برای سیستم کترینگ سازمانی

## 📋 مشخصات

| ویژگی | مقدار |
|-------|-------|
| پورت | 3001 |
| پایگاه داده | MongoDB |
| مستندات | `/api-docs` |
| Health Check | `/health` |

## 🚀 راه‌اندازی

### پیش‌نیازها

- Node.js v18+
- MongoDB
- RabbitMQ (اختیاری)

### نصب و اجرا

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

### متغیرهای محیطی

```bash
cp .env.example .env
```

| متغیر | توضیحات | پیش‌فرض |
|-------|---------|---------|
| `PORT` | پورت سرویس | 3001 |
| `MONGODB_URI` | آدرس MongoDB | mongodb://localhost:27017/catering_auth |
| `JWT_SECRET` | کلید رمزنگاری JWT | - |
| `JWT_ACCESS_EXPIRES_IN` | مدت اعتبار Access Token | 1h |
| `JWT_REFRESH_EXPIRES_IN` | مدت اعتبار Refresh Token | 7d |

## 🔧 قابلیت‌ها

### 1. ثبت‌نام (Register)
- ایجاد حساب کاربری جدید
- هش کردن رمز عبور با bcrypt
- ارسال ایمیل تأیید

### 2. ورود (Login)
- احراز هویت با ایمیل و رمز عبور
- صدور Access Token (1 ساعت)
- صدور Refresh Token (7 روز)
- ذخیره نشست کاربر

### 3. تمدید توکن (Refresh Token)
- تمدید Access Token با Refresh Token
- چرخش Refresh Token برای امنیت بیشتر

### 4. بازیابی رمز عبور
- ارسال لینک بازیابی به ایمیل
- اعتبار لینک: 1 ساعت

### 5. مدیریت نشست‌ها
- مشاهده نشست‌های فعال
- خروج از یک دستگاه
- خروج از همه دستگاه‌ها

## 📡 API Endpoints

| متد | مسیر | توضیحات |
|-----|------|---------|
| POST | `/api/v1/auth/register` | ثبت‌نام |
| POST | `/api/v1/auth/login` | ورود |
| POST | `/api/v1/auth/refresh-token` | تمدید توکن |
| POST | `/api/v1/auth/logout` | خروج |
| POST | `/api/v1/auth/logout-all` | خروج از همه دستگاه‌ها |
| POST | `/api/v1/auth/forgot-password` | درخواست بازیابی رمز |
| POST | `/api/v1/auth/reset-password` | بازنشانی رمز عبور |
| POST | `/api/v1/auth/verify-token` | اعتبارسنجی توکن |
| GET | `/api/v1/auth/sessions` | نشست‌های فعال |

## 📢 رویدادها (RabbitMQ)

| رویداد | توضیحات |
|--------|---------|
| `auth.user.registered` | کاربر جدید ثبت‌نام کرد |
| `auth.user.logged_in` | کاربر وارد شد |
| `auth.user.logged_out` | کاربر خارج شد |
| `auth.password.reset` | رمز عبور تغییر کرد |

## 🔒 امنیت

- هش رمز عبور با bcrypt (12 rounds)
- محدودیت ورود: 5 تلاش در دقیقه
- محدودیت بازیابی رمز: 3 درخواست در 15 دقیقه
- ذخیره Refresh Token در دیتابیس
- چرخش Refresh Token در هر تمدید

## 🗄️ مدل‌های داده

### Token
```javascript
{
  userId: String,
  token: String,
  type: 'refresh' | 'reset' | 'verify',
  expiresAt: Date,
  isRevoked: Boolean
}
```

### Session
```javascript
{
  userId: String,
  deviceInfo: {
    userAgent: String,
    ip: String,
    device: String,
    browser: String,
    os: String
  },
  refreshToken: String,
  lastActivityAt: Date,
  isActive: Boolean
}
```

## 🐳 Docker

```bash
# ساخت Image
docker build -t catering/auth-service .

# اجرا
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://mongo:27017/catering_auth \
  -e JWT_SECRET=your-secret \
  catering/auth-service
```

## 📁 ساختار پروژه

```
auth-service/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── validators/
│   ├── config/
│   ├── events/
│   ├── models/
│   ├── services/
│   ├── utils/
│   └── app.js
├── tests/
├── docs/
│   └── openapi.yaml
├── Dockerfile
├── package.json
└── README.md
```
