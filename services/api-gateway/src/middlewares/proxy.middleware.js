const { createProxyMiddleware } = require('http-proxy-middleware');
const { routes, getRouteConfig } = require('../config/routes');
const logger = require('../utils/logger');

/**
 * Create proxy middleware for a service
 * ایجاد میان‌افزار پروکسی برای یک سرویس
 */
const createServiceProxy = (routeConfig) => {
  return createProxyMiddleware({
    target: routeConfig.target,
    changeOrigin: true,
    pathRewrite: routeConfig.pathRewrite,
    timeout: 30000,
    proxyTimeout: 30000,

    /**
     * Handle proxy request
     */
    onProxyReq: (proxyReq, req, res) => {
      // Forward request ID
      if (req.requestId) {
        proxyReq.setHeader('X-Request-ID', req.requestId);
      }

      // Forward correlation ID
      if (req.headers['x-correlation-id']) {
        proxyReq.setHeader('X-Correlation-ID', req.headers['x-correlation-id']);
      }

      // Forward user info (set by auth middleware)
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('X-User-ID', req.headers['x-user-id']);
      }
      if (req.headers['x-user-email']) {
        proxyReq.setHeader('X-User-Email', req.headers['x-user-email']);
      }
      if (req.headers['x-user-role']) {
        proxyReq.setHeader('X-User-Role', req.headers['x-user-role']);
      }
      if (req.headers['x-company-id']) {
        proxyReq.setHeader('X-Company-ID', req.headers['x-company-id']);
      }

      logger.debug('پروکسی درخواست', {
        requestId: req.requestId,
        target: routeConfig.target,
        path: req.path,
        method: req.method
      });
    },

    /**
     * Handle proxy response
     */
    onProxyRes: (proxyRes, req, res) => {
      // Add gateway headers
      proxyRes.headers['X-Gateway'] = 'catering-api-gateway';
      proxyRes.headers['X-Request-ID'] = req.requestId;

      logger.debug('پروکسی پاسخ', {
        requestId: req.requestId,
        statusCode: proxyRes.statusCode,
        target: routeConfig.target
      });
    },

    /**
     * Handle proxy errors
     */
    onError: (err, req, res) => {
      logger.error('خطای پروکسی', {
        requestId: req.requestId,
        error: err.message,
        target: routeConfig.target,
        path: req.path
      });

      // Check if headers already sent
      if (res.headersSent) {
        return;
      }

      // Service unavailable
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(503).json({
          success: false,
          error: {
            code: 'ERR_SERVICE_UNAVAILABLE',
            message: 'سرویس مورد نظر در حال حاضر در دسترس نیست. لطفاً بعداً تلاش کنید',
            details: [],
            timestamp: new Date().toISOString()
          }
        });
      }

      // Timeout
      if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
        return res.status(504).json({
          success: false,
          error: {
            code: 'ERR_GATEWAY_TIMEOUT',
            message: 'زمان پاسخ‌دهی سرویس به پایان رسید',
            details: [],
            timestamp: new Date().toISOString()
          }
        });
      }

      // Generic error
      return res.status(502).json({
        success: false,
        error: {
          code: 'ERR_BAD_GATEWAY',
          message: 'خطا در ارتباط با سرویس',
          details: [],
          timestamp: new Date().toISOString()
        }
      });
    }
  });
};

/**
 * Setup all proxy routes
 * راه‌اندازی تمام مسیرهای پروکسی
 */
const setupProxyRoutes = (app) => {
  for (const [path, routeConfig] of Object.entries(routes)) {
    const proxy = createServiceProxy(routeConfig);
    app.use(path, proxy);
    logger.info(`پروکسی راه‌اندازی شد: ${path} -> ${routeConfig.target}`);
  }
};

/**
 * Dynamic proxy middleware
 * میان‌افزار پروکسی پویا
 */
const dynamicProxy = (req, res, next) => {
  const routeConfig = getRouteConfig(req.path);

  if (!routeConfig) {
    return next();
  }

  const proxy = createServiceProxy(routeConfig);
  return proxy(req, res, next);
};

module.exports = {
  createServiceProxy,
  setupProxyRoutes,
  dynamicProxy
};
