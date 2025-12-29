# @catering/service-client

کلاینت HTTP با قابلیت Retry و Circuit Breaker برای ارتباط بین سرویس‌ها

## نصب

```bash
npm install @catering/service-client
```

## استفاده

### ایجاد کلاینت

```javascript
const { ServiceClient } = require('@catering/service-client');

const client = new ServiceClient('http://user-service:3003', {
  timeout: 5000,
  retries: 3,
  retryDelay: 1000,
  circuitBreaker: {
    enabled: true,
    threshold: 5,
    timeout: 30000
  }
});
```

### درخواست‌های HTTP

```javascript
// GET
const users = await client.get('/api/v1/users');

// GET with params
const user = await client.get('/api/v1/users/123', {
  params: { include: 'company' }
});

// POST
const newUser = await client.post('/api/v1/users', {
  email: 'user@example.com',
  firstName: 'علی'
});

// PUT
await client.put('/api/v1/users/123', { firstName: 'محمد' });

// PATCH
await client.patch('/api/v1/users/123', { status: 'active' });

// DELETE
await client.delete('/api/v1/users/123');
```

### تنظیم توکن

```javascript
client.setAuthToken('jwt-token-here');

// یا در هر درخواست
await client.get('/api/v1/users', {
  headers: { Authorization: 'Bearer token' }
});
```

### Correlation ID

```javascript
client.setCorrelationId('request-123');

// یا در هر درخواست
await client.get('/api/v1/users', {
  correlationId: 'request-123'
});
```

### کلاینت‌های از پیش تنظیم شده

```javascript
const { createServiceClients } = require('@catering/service-client');

const clients = createServiceClients();

// استفاده
const user = await clients.user.get('/api/v1/users/123');
const menu = await clients.menu.get('/api/v1/menus/daily');
const order = await clients.order.post('/api/v1/orders', orderData);
```

## Circuit Breaker

Circuit Breaker از ارسال درخواست به سرویس‌های ناسالم جلوگیری می‌کند:

- **CLOSED**: درخواست‌ها عادی ارسال می‌شوند
- **OPEN**: درخواست‌ها بلافاصله رد می‌شوند (سرویس ناسالم)
- **HALF_OPEN**: یک درخواست آزمایشی ارسال می‌شود

```javascript
const client = new ServiceClient('http://service:3000', {
  circuitBreaker: {
    enabled: true,
    threshold: 5,      // تعداد خطا برای باز شدن
    timeout: 30000,    // زمان انتظار قبل از تلاش مجدد
    resetTimeout: 60000 // زمان بازنشانی شمارنده
  }
});

// بررسی وضعیت
console.log(client.getCircuitState()); // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
```

## Retry Logic

```javascript
const client = new ServiceClient('http://service:3000', {
  retries: 3,           // تعداد تلاش مجدد
  retryDelay: 1000,     // تأخیر بین تلاش‌ها (ms)
  retryCondition: (error) => {
    // فقط برای خطاهای شبکه و 5xx تلاش مجدد
    return !error.response || error.response.status >= 500;
  }
});
```

## متغیرهای محیطی

| متغیر | توضیحات |
|-------|---------|
| AUTH_SERVICE_URL | آدرس سرویس احراز هویت |
| USER_SERVICE_URL | آدرس سرویس کاربران |
| COMPANY_SERVICE_URL | آدرس سرویس شرکت‌ها |
| MENU_SERVICE_URL | آدرس سرویس منو |
| ORDER_SERVICE_URL | آدرس سرویس سفارشات |
| PAYMENT_SERVICE_URL | آدرس سرویس پرداخت |
| WALLET_SERVICE_URL | آدرس سرویس کیف پول |
| NOTIFICATION_SERVICE_URL | آدرس سرویس اعلان‌ها |
