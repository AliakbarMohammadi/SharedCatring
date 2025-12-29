# API Gateway - دروازه API

سرویس دروازه API برای سیستم کترینگ سازمانی

## 📋 مشخصات

| ویژگی | مقدار |
|-------|-------|
| پورت | 3000 |
| پایگاه داده | Redis |
| مستندات | `/api-docs` |
| Health Check | `/health` |

## 🚀 راه‌اندازی

### پیش‌نیازها

- Node.js v18+
- Redis Server
- npm یا yarn

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

فایل `.env.example` را به `.env` کپی کرده و مقادیر را تنظیم کنید:

```bash
cp .env.example .env
```

| متغیر | توضیحات | پیش‌فرض |
|-------|---------|---------|
| `PORT` | پورت سرویس | 3000 |
| `NODE_ENV` | محیط اجرا | development |
| `JWT_SECRET` | کلید رمزنگاری JWT | - |
| `REDIS_HOST` | آدرس Redis | localhost |
| `REDIS_PORT` | پورت Redis | 6379 |

## 🔧 قابلیت‌ها

### 1. مسیریابی (Routing)
درخواست‌ها را به سرویس‌های داخلی هدایت می‌کند:

| مسیر | سرویس | پورت |
|------|-------|------|
| `/api/v1/auth` | Auth Service | 3001 |
| `/api/v1/identity` | Identity Service | 3002 |
| `/api/v1/users` | User Service | 3003 |
| `/api/v1/companies` | Company Service | 3004 |
| `/api/v1/menu` | Menu Service | 3005 |
| `/api/v1/orders` | Order Service | 3006 |
| `/api/v1/invoices` | Invoice Service | 3007 |
| `/api/v1/payments` | Payment Service | 3008 |
| `/api/v1/wallets` | Wallet Service | 3009 |
| `/api/v1/notifications` | Notification Service | 3010 |
| `/api/v1/reports` | Reporting Service | 3011 |
| `/api/v1/files` | File Service | 3012 |

### 2. احراز هویت (Authentication)
- اعتبارسنجی توکن JWT
- انتقال اطلاعات کاربر به سرویس‌های داخلی

### 3. محدودیت نرخ (Rate Limiting)
- محدودیت پیش‌فرض: 100 درخواست در دقیقه
- ذخیره‌سازی در Redis

### 4. مسیرهای عمومی
مسیرهای زیر نیاز به احراز هویت ندارند:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/forgot-password`
- `GET /api/v1/menu/daily`
- `GET /health`

## 📚 مستندات API

مستندات Swagger در آدرس زیر در دسترس است:

```
http://localhost:3000/api-docs
```

## 🐳 Docker

### ساخت Image

```bash
docker build -t catering/api-gateway .
```

### اجرا با Docker

```bash
docker run -p 3000:3000 \
  -e REDIS_HOST=redis \
  -e JWT_SECRET=your-secret \
  catering/api-gateway
```

### اجرا با Docker Compose

```bash
docker-compose up api-gateway
```

## 🧪 تست

```bash
# اجرای تمام تست‌ها
npm test

# اجرای تست‌ها با watch
npm run test:watch

# اجرای تست‌ها با coverage
npm test -- --coverage
```

## 📁 ساختار پروژه

```
api-gateway/
├── src/
│   ├── config/
│   │   ├── index.js          # تنظیمات اصلی
│   │   └── routes.js         # تعریف مسیرها
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   ├── proxy.middleware.js
│   │   ├── requestId.middleware.js
│   │   ├── requestLogger.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── index.js
│   ├── utils/
│   │   ├── redis.js
│   │   └── logger.js
│   └── app.js
├── tests/
├── docs/
│   └── openapi.yaml
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## 🔒 امنیت

- Helmet برای تنظیم هدرهای امنیتی
- CORS با تنظیمات قابل پیکربندی
- Rate Limiting برای جلوگیری از حملات DDoS
- اعتبارسنجی JWT

## 📝 لاگ‌ها

لاگ‌ها با استفاده از Winston ذخیره می‌شوند:

- `logs/combined.log` - تمام لاگ‌ها
- `logs/error.log` - فقط خطاها
- Console - در محیط توسعه

## 🤝 مشارکت

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request بسازید
