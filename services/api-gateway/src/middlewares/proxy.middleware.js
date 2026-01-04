const { createProxyMiddleware } = require('http-proxy-middleware');
const { routes, getRouteConfig } = require('../config/routes');
const logger = require('../utils/logger');

/**
 * Default proxy configuration
 */
const DEFAULT_PROXY_CONFIG = {
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  followRedirects: true,
  secure: false,
  ws: false,
  xfwd: true,
  selfHandleResponse: false, // Let proxy handle response streaming
};

/**
 * Safe response sender - ensures we don't crash on already-sent headers
 */
const safeJsonResponse = (res, statusCode, body) => {
  try {
    if (res.headersSent) {
      logger.warn('Headers already sent, cannot send error response');
      return false;
    }
    if (res.writableEnded || res.finished) {
      logger.warn('Response already ended');
      return false;
    }
    res.status(statusCode).json(body);
    return true;
  } catch (error) {
    logger.error('Error sending response', { error: error.message });
    return false;
  }
};

/**
 * Create proxy middleware for a service with robust error handling
 */
const createServiceProxy = (routeConfig) => {
  const proxyOptions = {
    ...DEFAULT_PROXY_CONFIG,
    target: routeConfig.target,
    pathRewrite: routeConfig.pathRewrite,

    /**
     * Handle proxy request
     */
    onProxyReq: (proxyReq, req, res) => {
      try {
        logger.debug('پروکسی درخواست ارسال می‌شود', {
          requestId: req.requestId,
          target: routeConfig.target,
          originalUrl: req.originalUrl,
          path: req.path,
          method: req.method
        });

        // Forward headers
        if (req.requestId) {
          proxyReq.setHeader('X-Request-ID', req.requestId);
        }
        if (req.headers['x-correlation-id']) {
          proxyReq.setHeader('X-Correlation-ID', req.headers['x-correlation-id']);
        }
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

        // Handle request body
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.write(bodyData);
        }
      } catch (error) {
        logger.error('Error in onProxyReq', { error: error.message, path: req.path });
        // Don't throw - let the request continue
      }
    },

    /**
     * Handle proxy response
     */
    onProxyRes: (proxyRes, req, res) => {
      try {
        proxyRes.headers['X-Gateway'] = 'catering-api-gateway';
        proxyRes.headers['X-Request-ID'] = req.requestId || 'unknown';

        logger.debug('پروکسی پاسخ دریافت شد', {
          requestId: req.requestId,
          statusCode: proxyRes.statusCode,
          target: routeConfig.target,
          path: req.path
        });
      } catch (error) {
        logger.error('Error in onProxyRes', { error: error.message });
      }
    },

    /**
     * Handle proxy errors - CRITICAL: Must not crash the server
     */
    onError: (err, req, res) => {
      // Log the error with full details
      logger.error('خطای پروکسی', {
        requestId: req.requestId,
        errorCode: err.code,
        errorMessage: err.message,
        target: routeConfig.target,
        path: req.path,
        method: req.method,
        stack: err.stack
      });

      // Determine appropriate response based on error type
      let statusCode = 502;
      let errorCode = 'ERR_BAD_GATEWAY';
      let message = 'خطا در ارتباط با سرویس';

      // Connection refused - service is down
      if (err.code === 'ECONNREFUSED') {
        statusCode = 503;
        errorCode = 'ERR_SERVICE_UNAVAILABLE';
        message = `سرویس ${routeConfig.description || 'مورد نظر'} در دسترس نیست`;
      }
      // Connection reset
      else if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
        statusCode = 502;
        errorCode = 'ERR_CONNECTION_RESET';
        message = 'ارتباط با سرویس قطع شد';
      }
      // DNS resolution failed
      else if (err.code === 'ENOTFOUND') {
        statusCode = 503;
        errorCode = 'ERR_SERVICE_NOT_FOUND';
        message = 'آدرس سرویس یافت نشد';
      }
      // Timeout errors
      else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED' || err.code === 'ESOCKETTIMEDOUT') {
        statusCode = 504;
        errorCode = 'ERR_GATEWAY_TIMEOUT';
        message = 'زمان پاسخ‌دهی سرویس به پایان رسید';
      }
      // Socket hang up
      else if (err.message && err.message.includes('socket hang up')) {
        statusCode = 502;
        errorCode = 'ERR_SOCKET_HANGUP';
        message = 'ارتباط با سرویس به طور ناگهانی قطع شد';
      }

      // Send error response safely
      const sent = safeJsonResponse(res, statusCode, {
        success: false,
        error: {
          code: errorCode,
          message,
          details: [{
            target: routeConfig.target,
            errorCode: err.code,
            path: req.path
          }],
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });

      // If we couldn't send JSON, try to end the response
      if (!sent) {
        try {
          if (!res.writableEnded) {
            res.end();
          }
        } catch (e) {
          logger.error('Failed to end response', { error: e.message });
        }
      }
    }
  };

  // Create the proxy middleware
  let proxy;
  try {
    proxy = createProxyMiddleware(proxyOptions);
  } catch (error) {
    logger.error('Failed to create proxy middleware', { 
      error: error.message, 
      target: routeConfig.target 
    });
    
    // Return a fallback middleware that returns 503
    return (req, res, next) => {
      safeJsonResponse(res, 503, {
        success: false,
        error: {
          code: 'ERR_PROXY_INIT_FAILED',
          message: 'پروکسی سرویس راه‌اندازی نشد',
          timestamp: new Date().toISOString()
        }
      });
    };
  }

  // Wrap proxy in error-catching middleware
  return (req, res, next) => {
    try {
      proxy(req, res, (err) => {
        if (err) {
          logger.error('Proxy middleware error', { error: err.message, path: req.path });
          safeJsonResponse(res, 502, {
            success: false,
            error: {
              code: 'ERR_PROXY_ERROR',
              message: 'خطا در پردازش درخواست',
              timestamp: new Date().toISOString()
            }
          });
        } else {
          next();
        }
      });
    } catch (error) {
      logger.error('Unexpected proxy error', { error: error.message, path: req.path });
      safeJsonResponse(res, 500, {
        success: false,
        error: {
          code: 'ERR_INTERNAL',
          message: 'خطای داخلی سرور',
          timestamp: new Date().toISOString()
        }
      });
    }
  };
};

/**
 * Setup all proxy routes with error handling
 */
const setupProxyRoutes = (app) => {
  for (const [path, routeConfig] of Object.entries(routes)) {
    try {
      const proxy = createServiceProxy(routeConfig);
      app.use(path, proxy);
      logger.info(`پروکسی راه‌اندازی شد: ${path} -> ${routeConfig.target}`);
    } catch (error) {
      logger.error(`خطا در راه‌اندازی پروکسی: ${path}`, { error: error.message });
      
      // Add fallback route that returns 503
      app.use(path, (req, res) => {
        safeJsonResponse(res, 503, {
          success: false,
          error: {
            code: 'ERR_SERVICE_UNAVAILABLE',
            message: `سرویس ${routeConfig.description || path} در دسترس نیست`,
            timestamp: new Date().toISOString()
          }
        });
      });
    }
  }
};

/**
 * Dynamic proxy middleware
 */
const dynamicProxy = (req, res, next) => {
  const routeConfig = getRouteConfig(req.path);

  if (!routeConfig) {
    return next();
  }

  try {
    const proxy = createServiceProxy(routeConfig);
    return proxy(req, res, next);
  } catch (error) {
    logger.error('Dynamic proxy error', { error: error.message, path: req.path });
    safeJsonResponse(res, 502, {
      success: false,
      error: {
        code: 'ERR_PROXY_ERROR',
        message: 'خطا در پردازش درخواست',
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = {
  createServiceProxy,
  setupProxyRoutes,
  dynamicProxy,
  DEFAULT_PROXY_CONFIG
};
