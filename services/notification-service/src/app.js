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
  customSiteTitle: 'سرویس اعلان‌ها - مستندات API'
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
app.use('/api/v1/notifications', v1Routes);

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

// Event handlers setup
const setupEventHandlers = () => {
  const { notificationService } = require('./services');

  const events = [
    'order.created',
    'order.confirmed',
    'order.ready',
    'order.delivered',
    'payment.completed',
    'company.approved',
    'wallet.low_balance',
    'wallet.charged'
  ];

  events.forEach(eventName => {
    eventSubscriber.registerHandler(eventName, async (data) => {
      logger.info(`رویداد ${eventName} دریافت شد`, { data });
      try {
        await notificationService.sendFromEvent(eventName, data);
      } catch (error) {
        logger.error(`خطا در پردازش رویداد ${eventName}`, { error: error.message });
      }
    });
  });
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await eventPublisher.connect();
    await eventSubscriber.connect();
    
    setupEventHandlers();

    app.listen(config.port, () => {
      logger.info(`🔔 Notification Service در حال اجرا روی پورت ${config.port}`);
      logger.info(`📚 مستندات API: http://localhost:${config.port}/api-docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/health`);
      logger.info(`🌍 محیط: ${config.env}`);
    });
  } catch (error) {
    logger.error('خطا در راه‌اندازی سرور', { error: error.message });
    process.exit(1);
  }
};

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
