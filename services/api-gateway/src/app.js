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
 * Create Express application
 * ایجاد برنامه Express
 */
const createApp = () => {
  const app = express();

  // Trust proxy (for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);

  // Security middlewares
  app.use(helmet({
    contentSecurityPolicy: false // Disable for Swagger UI
  }));

  // CORS
  app.use(cors(config.cors));

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logging (Morgan)
  if (config.env === 'development') {
    app.use(morgan('dev'));
  }

  // Request ID middleware
  app.use(requestIdMiddleware);

  // Custom request logger
  app.use(requestLoggerMiddleware);

  // Rate limiting
  app.use(dynamicRateLimiter);

  // Health check endpoint (before auth)
  app.get('/health', (req, res) => {
    const redisStatus = redis.isReady() ? 'connected' : 'disconnected';
    
    res.json({
      success: true,
      data: {
        service: config.serviceName,
        status: 'healthy',
        version: '1.0.0',
        environment: config.env,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dependencies: {
          redis: redisStatus
        }
      },
      message: 'سرویس در حال اجرا است'
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

  // Setup proxy routes to microservices
  setupProxyRoutes(app);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

/**
 * Start server
 * راه‌اندازی سرور
 */
const startServer = async () => {
  try {
    // Initialize Redis connection
    redis.getClient();
    logger.info('در حال اتصال به Redis...');

    // Create app
    const app = createApp();

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`🚀 API Gateway در حال اجرا روی پورت ${config.port}`);
      logger.info(`📚 مستندات API: http://localhost:${config.port}/api-docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/health`);
      logger.info(`🌍 محیط: ${config.env}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`سیگنال ${signal} دریافت شد. در حال خاموش شدن...`);
      
      server.close(async () => {
        logger.info('سرور HTTP بسته شد');
        
        // Close Redis connection
        await redis.close();
        
        logger.info('خاموش شدن کامل شد');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('خاموش شدن اجباری');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('خطا در راه‌اندازی سرور', { error: error.message });
    process.exit(1);
  }
};

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
