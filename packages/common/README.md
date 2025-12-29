# @catering/common

پکیج مشترک برای سیستم کترینگ سازمانی

## نصب

```bash
npm install @catering/common
```

## استفاده

### Errors (خطاها)

```javascript
const { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError
} = require('@catering/common');

// خطای عمومی
throw new AppError('پیام خطا', 400, 'ERR_CODE');

// خطای اعتبارسنجی
throw new ValidationError([{ field: 'email', message: 'ایمیل نامعتبر است' }]);

// خطای یافت نشدن
throw new NotFoundError('کاربر');

// خطای احراز هویت
throw UnauthorizedError.invalidCredentials();
throw UnauthorizedError.tokenExpired();

// خطای دسترسی
throw ForbiddenError.insufficientPermissions('مدیریت کاربران');

// خطای تکراری
throw ConflictError.duplicateEmail();
```

### Middlewares (میان‌افزارها)

```javascript
const { errorHandler, notFoundHandler, requestLogger } = require('@catering/common');
const logger = require('@catering/logger');

// Error handler
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// Request logger
app.use(requestLogger(logger));
```

### Utils (ابزارها)

```javascript
const { 
  // Pagination
  parsePagination, 
  buildPaginationMeta,
  
  // Response
  success, 
  created, 
  paginated,
  
  // Date helpers
  toJalaali,
  formatPersianDate
} = require('@catering/common');

// Pagination
const pagination = parsePagination(req.query);
const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

// Response
success(res, data, 'عملیات موفق');
created(res, newUser, 'کاربر ایجاد شد');
paginated(res, users, meta);

// Date
const persianDate = toJalaali(new Date()); // '1402/10/25'
const formatted = formatPersianDate(new Date()); // '25 دی 1402'
```

### Constants (ثابت‌ها)

```javascript
const { 
  ROLES, 
  ROLE_LABELS,
  ORDER_STATUS, 
  ORDER_STATUS_LABELS,
  COMPANY_STATUS,
  hasPermission,
  isValidTransition
} = require('@catering/common');

// Roles
console.log(ROLES.EMPLOYEE); // 'employee'
console.log(ROLE_LABELS[ROLES.EMPLOYEE]); // 'کارمند'

// Order status
console.log(ORDER_STATUS.PENDING); // 'pending'
console.log(ORDER_STATUS_LABELS[ORDER_STATUS.PENDING]); // 'در انتظار تأیید'

// Check permission
if (hasPermission(user.role, 'order:create')) {
  // ...
}

// Check status transition
if (isValidTransition('pending', 'confirmed')) {
  // ...
}
```
