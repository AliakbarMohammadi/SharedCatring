const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const config = require('./config');
const logger = require('./utils/logger');
const redis = require('./utils/redis');
const { routes } = require('./config/routes');

const {
  requestIdMiddleware,
  requestLoggerMiddleware,
  authMiddleware,
  dynamicRateLimiter,
  setupProxyRoutes,
  errorHandler,
  notFoundHandler
} = require('./middlewares');

/**
 * Get all proxy paths from routes config
 */
const getProxyPaths = () => Object.keys(routes);

/**
 * Check if request should skip body parsing (will be proxied)
 */
const shouldSkipBodyParsing = (req) => {
  const proxyPaths = getProxyPaths();
  return proxyPaths.some(proxyPath => req.path.startsWith(proxyPath));
};

/**
 * Create Express application
 */
const createApp = () => {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Security middlewares
  app.use(helmet({
    contentSecurityPolicy: false
  }));

  // CORS
  app.use(cors(config.cors));

  // HTTP request logging
  if (config.env === 'development') {
    app.use(morgan('dev'));
  }

  // Request ID middleware
  app.use(requestIdMiddleware);

  // Custom request logger
  app.use(requestLoggerMiddleware);

  // Rate limiting (with error handling)
  app.use((req, res, next) => {
    try {
      dynamicRateLimiter(req, res, next);
    } catch (error) {
      logger.error('Rate limiter error', { error: error.message });
      next(); // Continue without rate limiting if it fails
    }
  });

  // Health check endpoint - ALWAYS responds, even if dependencies are down
  app.get('/health', async (req, res) => {
    let redisStatus = 'unknown';
    let redisLatency = null;

    try {
      const start = Date.now();
      redisStatus = redis.isReady() ? 'connected' : 'disconnected';
      redisLatency = Date.now() - start;
    } catch (error) {
      redisStatus = 'error';
      logger.warn('Health check: Redis error', { error: error.message });
    }

    const isHealthy = true; // Gateway itself is healthy if it can respond
    const isFullyHealthy = redisStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
      success: true,
      data: {
        service: config.serviceName,
        status: isFullyHealthy ? 'healthy' : 'partial',
        version: '1.0.0',
        environment: config.env,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        },
        dependencies: {
          redis: {
            status: redisStatus,
            latency: redisLatency
          }
        }
      },
      message: isFullyHealthy ? 'سرویس در حال اجرا است' : 'سرویس با محدودیت در حال اجرا است'
    });
  });

  // Liveness probe - minimal check
  app.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
  });

  // Readiness probe
  app.get('/health/ready', (req, res) => {
    const isReady = redis.isReady();
    res.status(isReady ? 200 : 503).json({ 
      status: isReady ? 'ready' : 'not_ready',
      redis: isReady ? 'connected' : 'disconnected'
    });
  });

  // Swagger documentation
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API Gateway - سیستم کترینگ',
      customfavIcon: '/favicon.ico'
    }));
    logger.info('مستندات Swagger در /api-docs در دسترس است');
  } catch (error) {
    logger.warn('بارگذاری مستندات Swagger ناموفق بود', { error: error.message });
  }

  // Authentication middleware
  app.use(authMiddleware);

  // Body parsing for proxy routes
  app.use((req, res, next) => {
    if (shouldSkipBodyParsing(req)) {
      express.json({ limit: '10mb' })(req, res, (err) => {
        if (err) {
          logger.error('خطا در پارس کردن JSON', { error: err.message });
          return res.status(400).json({
            success: false,
            error: {
              code: 'ERR_INVALID_JSON',
              message: 'فرمت JSON نامعتبر است',
              details: [],
              timestamp: new Date().toISOString()
            }
          });
        }
        next();
      });
    } else {
      express.json({ limit: '10mb' })(req, res, next);
    }
  });

  app.use((req, res, next) => {
    if (!shouldSkipBodyParsing(req)) {
      express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
    } else {
      next();
    }
  });

  // Setup proxy routes to microservices
  setupProxyRoutes(app);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

/**
 * Start server with robust error handling
 */
const startServer = async () => {
  // Setup global error handlers FIRST
  setupGlobalErrorHandlers();

  try {
    // Initialize Redis connection (don't fail if Redis is down)
    try {
      redis.getClient();
      logger.info('در حال اتصال به Redis...');
    } catch (redisError) {
      logger.warn('Redis در دسترس نیست، ادامه بدون Redis', { error: redisError.message });
    }

    // Create app
    const app = createApp();

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`🚀 API Gateway در حال اجرا روی پورت ${config.port}`);
      logger.info(`📚 مستندات API: http://localhost:${config.port}/api-docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/health`);
      logger.info(`🌍 محیط: ${config.env}`);
      
      const proxyPaths = getProxyPaths();
      logger.info(`📡 مسیرهای پروکسی: ${proxyPaths.join(', ')}`);
    });

    // Server configuration
    server.timeout = 60000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error', { error: error.message, code: error.code });
      if (error.code === 'EADDRINUSE') {
        logger.error(`پورت ${config.port} در حال استفاده است`);
        process.exit(1);
      }
    });

    // Handle client errors (don't crash on bad requests)
    server.on('clientError', (error, socket) => {
      logger.warn('Client error', { error: error.message });
      if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`سیگنال ${signal} دریافت شد. در حال خاموش شدن...`);
      
      server.close(async () => {
        logger.info('سرور HTTP بسته شد');
        
        try {
          await redis.close();
        } catch (e) {
          logger.warn('خطا در بستن Redis', { error: e.message });
        }
        
        logger.info('خاموش شدن کامل شد');
        process.exit(0);
      });

      // Force close after 15 seconds
      setTimeout(() => {
        logger.error('خاموش شدن اجباری');
        process.exit(1);
      }, 15000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('خطا در راه‌اندازی سرور', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

/**
 * Setup global error handlers to prevent crashes
 */
const setupGlobalErrorHandlers = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception - سرور ادامه می‌دهد', {
      error: error.message,
      stack: error.stack,
      type: 'uncaughtException'
    });
    
    // In production, you might want to restart gracefully
    // For now, we log and continue
    if (config.env === 'production') {
      logger.error('در محیط Production، توصیه می‌شود سرور ریستارت شود');
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection - سرور ادامه می‌دهد', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      type: 'unhandledRejection'
    });
  });

  // Handle warnings
  process.on('warning', (warning) => {
    logger.warn('Node.js Warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack
    });
  });

  logger.info('Global error handlers configured');
};

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
