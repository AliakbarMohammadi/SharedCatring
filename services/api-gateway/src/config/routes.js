/**
 * Service routes configuration
 * پیکربندی مسیرهای سرویس‌ها
 */

const routes = {
  '/api/v1/auth': {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    pathRewrite: { '^/api/v1/auth': '/api/v1/auth' },
    description: 'سرویس احراز هویت'
  },
  '/api/v1/identity': {
    target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002',
    pathRewrite: { '^/api/v1/identity': '/api/v1/identity' },
    description: 'سرویس هویت و دسترسی'
  },
  '/api/v1/users': {
    target: process.env.USER_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: { '^/api/v1/users': '/api/v1/users' },
    description: 'سرویس کاربران'
  },
  '/api/v1/companies': {
    target: process.env.COMPANY_SERVICE_URL || 'http://localhost:3004',
    pathRewrite: { '^/api/v1/companies': '/api/v1/companies' },
    description: 'سرویس شرکت‌ها'
  },
  '/api/v1/menu': {
    target: process.env.MENU_SERVICE_URL || 'http://localhost:3005',
    pathRewrite: { '^/api/v1/menu': '/api/v1/menu' },
    description: 'سرویس منو'
  },
  '/api/v1/orders': {
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:3006',
    pathRewrite: { '^/api/v1/orders': '/api/v1/orders' },
    description: 'سرویس سفارشات'
  },
  '/api/v1/invoices': {
    target: process.env.INVOICE_SERVICE_URL || 'http://localhost:3007',
    pathRewrite: { '^/api/v1/invoices': '/api/v1/invoices' },
    description: 'سرویس فاکتورها'
  },
  '/api/v1/payments': {
    target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3008',
    pathRewrite: { '^/api/v1/payments': '/api/v1/payments' },
    description: 'سرویس پرداخت'
  },
  '/api/v1/wallets': {
    target: process.env.WALLET_SERVICE_URL || 'http://localhost:3009',
    pathRewrite: { '^/api/v1/wallets': '/api/v1/wallets' },
    description: 'سرویس کیف پول'
  },
  '/api/v1/notifications': {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3010',
    pathRewrite: { '^/api/v1/notifications': '/api/v1/notifications' },
    description: 'سرویس اعلان‌ها'
  },
  '/api/v1/reports': {
    target: process.env.REPORTING_SERVICE_URL || 'http://localhost:3011',
    pathRewrite: { '^/api/v1/reports': '/api/v1/reports' },
    description: 'سرویس گزارشات'
  },
  '/api/v1/files': {
    target: process.env.FILE_SERVICE_URL || 'http://localhost:3012',
    pathRewrite: { '^/api/v1/files': '/api/v1/files' },
    description: 'سرویس فایل‌ها'
  }
};

/**
 * Public routes that don't require authentication
 * مسیرهای عمومی که نیاز به احراز هویت ندارند
 */
const publicRoutes = [
  { method: 'POST', path: '/api/v1/auth/login' },
  { method: 'POST', path: '/api/v1/auth/register' },
  { method: 'POST', path: '/api/v1/auth/forgot-password' },
  { method: 'POST', path: '/api/v1/auth/reset-password' },
  { method: 'POST', path: '/api/v1/auth/refresh-token' },
  { method: 'GET', path: '/api/v1/menu/daily' },
  { method: 'GET', path: '/api/v1/menu/categories' },
  { method: 'GET', path: '/api/v1/menu/items' },
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/api-docs' }
];

/**
 * Check if route is public
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @returns {boolean}
 */
const isPublicRoute = (method, path) => {
  return publicRoutes.some(route => {
    if (route.method !== method && route.method !== '*') return false;
    
    // Exact match
    if (route.path === path) return true;
    
    // Prefix match for paths ending with wildcard
    if (route.path.endsWith('*')) {
      const prefix = route.path.slice(0, -1);
      return path.startsWith(prefix);
    }
    
    // Prefix match for swagger
    if (path.startsWith(route.path)) return true;
    
    return false;
  });
};

/**
 * Get route config for path
 * @param {string} path - Request path
 * @returns {Object|null}
 */
const getRouteConfig = (path) => {
  for (const [prefix, config] of Object.entries(routes)) {
    if (path.startsWith(prefix)) {
      return { prefix, ...config };
    }
  }
  return null;
};

module.exports = {
  routes,
  publicRoutes,
  isPublicRoute,
  getRouteConfig
};
