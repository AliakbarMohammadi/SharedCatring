const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../../config');

const createProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onError: (err, req, res) => {
      console.error('Proxy error:', err.message);
      res.status(503).json({
        success: false,
        error: {
          code: 'ERR_1008',
          message: 'سرویس در حال حاضر در دسترس نیست',
          details: []
        }
      });
    },
    onProxyReq: (proxyReq, req) => {
      // Forward correlation ID
      if (req.correlationId) {
        proxyReq.setHeader('X-Correlation-ID', req.correlationId);
      }
      // Forward user info if authenticated
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.userId);
        proxyReq.setHeader('X-User-Role', req.user.role);
        if (req.user.companyId) {
          proxyReq.setHeader('X-Company-ID', req.user.companyId);
        }
      }
    }
  });
};

const setupProxyRoutes = (app) => {
  const { authenticate, optionalAuth } = require('../middlewares/auth');
  const { authRateLimiter } = require('../middlewares/rateLimiter');

  // Auth Service - Public routes
  app.use('/api/v1/auth', createProxy(config.services.auth, {
    '^/api/v1/auth': '/api/v1/auth'
  }));

  // Identity Service - Protected routes
  app.use('/api/v1/identity', authenticate, createProxy(config.services.identity, {
    '^/api/v1/identity': '/api/v1/identity'
  }));

  // User Service - Protected routes
  app.use('/api/v1/users', authenticate, createProxy(config.services.user, {
    '^/api/v1/users': '/api/v1/users'
  }));

  // Company Service - Protected routes
  app.use('/api/v1/companies', authenticate, createProxy(config.services.company, {
    '^/api/v1/companies': '/api/v1/companies'
  }));

  // Menu Service - Mixed (public read, protected write)
  app.use('/api/v1/menus', optionalAuth, createProxy(config.services.menu, {
    '^/api/v1/menus': '/api/v1/menus'
  }));

  // Order Service - Protected routes
  app.use('/api/v1/orders', authenticate, createProxy(config.services.order, {
    '^/api/v1/orders': '/api/v1/orders'
  }));

  // Invoice Service - Protected routes
  app.use('/api/v1/invoices', authenticate, createProxy(config.services.invoice, {
    '^/api/v1/invoices': '/api/v1/invoices'
  }));

  // Payment Service - Protected routes
  app.use('/api/v1/payments', authenticate, createProxy(config.services.payment, {
    '^/api/v1/payments': '/api/v1/payments'
  }));

  // Wallet Service - Protected routes
  app.use('/api/v1/wallets', authenticate, createProxy(config.services.wallet, {
    '^/api/v1/wallets': '/api/v1/wallets'
  }));

  // Notification Service - Protected routes
  app.use('/api/v1/notifications', authenticate, createProxy(config.services.notification, {
    '^/api/v1/notifications': '/api/v1/notifications'
  }));

  // Reporting Service - Protected routes
  app.use('/api/v1/reports', authenticate, createProxy(config.services.reporting, {
    '^/api/v1/reports': '/api/v1/reports'
  }));

  // File Service - Protected routes
  app.use('/api/v1/files', authenticate, createProxy(config.services.file, {
    '^/api/v1/files': '/api/v1/files'
  }));
};

module.exports = setupProxyRoutes;
