# @catering/logger

لاگر مبتنی بر Winston برای سیستم کترینگ سازمانی

## نصب

```bash
npm install @catering/logger
```

## استفاده

### ایجاد لاگر

```javascript
const { createLogger } = require('@catering/logger');

const logger = createLogger('auth-service', {
  level: 'info',           // سطح لاگ (debug, info, warn, error)
  logDir: 'logs',          // مسیر ذخیره فایل‌های لاگ
  enableConsole: true,     // نمایش در کنسول
  enableFile: true,        // ذخیره در فایل
  enableJson: false        // فرمت JSON
});
```

### لاگ‌گیری ساده

```javascript
logger.info('پیام اطلاعاتی');
logger.warn('پیام هشدار');
logger.error('پیام خطا');
logger.debug('پیام دیباگ');

// با متادیتا
logger.info('کاربر وارد شد', { userId: '123', email: 'user@example.com' });
```

### لاگ درخواست HTTP

```javascript
// در middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.logRequest(req, res, Date.now() - start);
  });
  next();
});
```

### لاگ خطا

```javascript
try {
  // ...
} catch (error) {
  logger.logError(error, { userId: req.user?.id, action: 'create_order' });
}
```

### لاگ رویداد

```javascript
logger.logEvent('order.created', { orderId: '123', userId: '456' });
```

### Child Logger

```javascript
const { createChildLogger } = require('@catering/logger');

const requestLogger = createChildLogger(logger, { requestId: req.requestId });
requestLogger.info('پردازش درخواست');
```

## متغیرهای محیطی

| متغیر | توضیحات | پیش‌فرض |
|-------|---------|---------|
| LOG_LEVEL | سطح لاگ | info |
| LOG_DIR | مسیر فایل‌های لاگ | logs |
| NODE_ENV | محیط اجرا | development |

## خروجی نمونه

### Console (Development)
```
2024-01-15 10:30:45 [auth-service] info: کاربر وارد شد {"userId":"123"}
```

### JSON (Production)
```json
{
  "level": "info",
  "message": "کاربر وارد شد",
  "service": "auth-service",
  "userId": "123",
  "timestamp": "2024-01-15T10:30:45.000Z"
}
```
