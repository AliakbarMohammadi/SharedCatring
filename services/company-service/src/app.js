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
const { errorHandler, notFoundHandler, generalLimiter, extractUser } = require('./api/middlewares');

const createApp = () => {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (config.env === 'development') app.use(morgan('dev'));
  app.use(generalLimiter);
  app.use(extractUser);

  app.get('/health', async (req, res) => {
    const { sequelize } = require('./config/database');
    let dbStatus = 'disconnected';
    try { await sequelize.authenticate(); dbStatus = 'connected'; } catch (e) {}
    res.json({
      success: true,
      data: {
        service: config.serviceName, status: 'healthy', version: '1.0.0', environment: config.env,
        timestamp: new Date().toISOString(), uptime: process.uptime(),
        dependencies: { postgresql: dbStatus, rabbitmq: eventPublisher.isConnected ? 'connected' : 'disconnected' }
      },
      message: 'سرویس در حال اجرا است'
    });
  });

  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customSiteTitle: 'Company Service - سرویس شرکت‌ها' }));
    logger.info('مستندات Swagger در /api-docs در دسترس است');
  } catch (error) {
    logger.warn('بارگذاری Swagger ناموفق بود', { error: error.message });
  }

  app.use('/api', apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

const startServer = async () => {
  try {
    await connectDB();
    await eventPublisher.connect();

    // Seed default data
    const { seedDatabase } = require('./database/seeders/seed');
    await seedDatabase();

    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Company Service در حال اجرا روی پورت ${config.port}`);
      logger.info(`📚 مستندات API: http://localhost:${config.port}/api-docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/health`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`سیگنال ${signal} دریافت شد`);
      server.close(async () => {
        await disconnectDB();
        await eventPublisher.close();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    return server;
  } catch (error) {
    logger.error('خطا در راه‌اندازی سرور', { error: error.message });
    process.exit(1);
  }
};

if (require.main === module) startServer();
module.exports = { createApp, startServer };
