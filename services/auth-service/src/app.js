const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const config = require('./config');
const { connectDB, disconnectDB } = require('./config/database');
const logger = require('./utils/logger');
const eventPublisher = require('./events/publisher');
const apiRoutes = require('./api/routes');
const { errorHandler, notFoundHandler, generalLimiter } = require('./api/middlewares');

/**
 * Create Express application
 * ایجاد برنامه Express
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
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  }));

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // HTTP request logging
  if (config.env === 'development') {
    app.use(morgan('dev'));
  }

  // General rate limiting
  app.use(generalLimiter);

  // Health check endpoint
  app.get('/health', async (req, res) => {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

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
          mongodb: dbStatus,
          rabbitmq: eventPublisher.isConnected ? 'connected' : 'disconnected'
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
      customSiteTitle: 'Auth Service - سرویس احراز هویت'
    }));
    logger.info('مستندات Swagger در /api-docs در دسترس است');
  } catch (error) {
    logger.warn('بارگذاری مستندات Swagger ناموفق بود', { error: error.message });
  }

  // API routes
  app.use('/api', apiRoutes);

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
    // Connect to MongoDB
    await connectDB();

    // Connect to RabbitMQ
    await eventPublisher.connect();

    // Create app
    const app = createApp();

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Auth Service در حال اجرا روی پورت ${config.port}`);
      logger.info(`📚 مستندات API: http://localhost:${config.port}/api-docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/health`);
      logger.info(`🌍 محیط: ${config.env}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`سیگنال ${signal} دریافت شد. در حال خاموش شدن...`);

      server.close(async () => {
        logger.info('سرور HTTP بسته شد');

        await disconnectDB();
        await eventPublisher.close();

        logger.info('خاموش شدن کامل شد');
        process.exit(0);
      });

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
