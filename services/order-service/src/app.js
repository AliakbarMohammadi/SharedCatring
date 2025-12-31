const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const { connectDB } = require('./config/database');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const errorHandler = require('./api/middlewares/errorHandler');
const { extractUser } = require('./api/middlewares/auth');
const eventPublisher = require('./events/publisher');
const eventSubscriber = require('./events/subscriber');

// Routes
const v1Routes = require('./api/routes/v1');

// Models (to initialize associations)
require('./models');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.debug(message.trim()) }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Extract user from headers
app.use(extractUser);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'سرویس سفارشات - مستندات API'
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      service: config.serviceName,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'سرویس در حال اجرا است'
  });
});

// API routes
app.use('/api/v1/orders', v1Routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_NOT_FOUND',
      message: 'مسیر مورد نظر یافت نشد',
      details: [],
      timestamp: new Date().toISOString()
    }
  });
});

// Error handler
app.use(errorHandler);

// Event handlers
const setupEventHandlers = () => {
  const { orderService } = require('./services');

  eventSubscriber.registerHandler('payment.completed', async (data) => {
    logger.info('پرداخت تکمیل شد', { orderId: data.orderId });
    try {
      await orderService.updateStatus(data.orderId, 'confirmed', null, 'پرداخت تکمیل شد');
    } catch (error) {
      logger.error('خطا در تأیید سفارش پس از پرداخت', { error: error.message });
    }
  });

  eventSubscriber.registerHandler('payment.failed', async (data) => {
    logger.info('پرداخت ناموفق', { orderId: data.orderId });
    try {
      await orderService.cancel(data.orderId, null, 'پرداخت ناموفق بود');
    } catch (error) {
      logger.error('خطا در لغو سفارش پس از پرداخت ناموفق', { error: error.message });
    }
  });
};

// Start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connectDB();

    // Connect to RabbitMQ
    await eventPublisher.connect();
    await eventSubscriber.connect();
    
    // Setup event handlers
    setupEventHandlers();

    // Start listening
    app.listen(config.port, () => {
      logger.info(`🚀 Order Service در حال اجرا روی پورت ${config.port}`);
      logger.info(`📚 مستندات API: http://localhost:${config.port}/api-docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/health`);
      logger.info(`🌍 محیط: ${config.env}`);
    });
  } catch (error) {
    logger.error('خطا در راه‌اندازی سرور', { error: error.message });
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('دریافت سیگنال SIGTERM، در حال خاموش شدن...');
  await eventPublisher.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('دریافت سیگنال SIGINT، در حال خاموش شدن...');
  await eventPublisher.close();
  process.exit(0);
});

startServer();

module.exports = app;
