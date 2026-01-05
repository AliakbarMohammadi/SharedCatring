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
const internalRoutes = require('./api/routes/v1/internal.routes');

// Models
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
  customSiteTitle: 'سرویس کیف پول - مستندات API'
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
app.use('/api/v1/wallets', v1Routes);
app.use('/internal', internalRoutes);

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
  const { walletService } = require('./services');

  // Handle order created - deduct from wallet
  eventSubscriber.registerHandler('order.created', async (data) => {
    logger.info('سفارش ایجاد شد - کسر از کیف پول', { orderId: data.orderId });
    try {
      if (data.paymentMethod === 'wallet' && data.userPayable > 0) {
        await walletService.deduct(
          data.userId,
          data.userPayable,
          'personal',
          'order',
          data.orderId,
          `پرداخت سفارش ${data.orderNumber}`
        );
      }
      if (data.companyPayable > 0 && data.companyId) {
        await walletService.deduct(
          data.userId,
          data.companyPayable,
          'company',
          'order',
          data.orderId,
          `سهم سازمانی سفارش ${data.orderNumber}`
        );
      }
    } catch (error) {
      logger.error('خطا در کسر از کیف پول', { error: error.message });
    }
  });

  // Handle order cancelled - refund to wallet
  eventSubscriber.registerHandler('order.cancelled', async (data) => {
    logger.info('سفارش لغو شد - برگشت به کیف پول', { orderId: data.orderId });
    try {
      if (data.userPayable > 0) {
        await walletService.refund(
          data.userId,
          data.userPayable,
          'personal',
          'order',
          data.orderId,
          `استرداد سفارش ${data.orderNumber}`
        );
      }
      if (data.companyPayable > 0) {
        await walletService.refund(
          data.userId,
          data.companyPayable,
          'company',
          'order',
          data.orderId,
          `استرداد سهم سازمانی سفارش ${data.orderNumber}`
        );
      }
    } catch (error) {
      logger.error('خطا در برگشت به کیف پول', { error: error.message });
    }
  });

  // Handle employee added - create wallet
  eventSubscriber.registerHandler('employee.added', async (data) => {
    logger.info('کارمند اضافه شد - ایجاد کیف پول', { userId: data.userId });
    try {
      await walletService.getOrCreateWallet(data.userId, data.companyId);
    } catch (error) {
      logger.error('خطا در ایجاد کیف پول', { error: error.message });
    }
  });

  // Handle payment completed - topup wallet
  eventSubscriber.registerHandler('payment.completed', async (data) => {
    if (data.purpose === 'wallet_topup') {
      logger.info('پرداخت شارژ کیف پول تکمیل شد', { userId: data.userId });
      try {
        await walletService.topupPersonal(
          data.userId,
          data.amount,
          data.paymentId,
          'شارژ کیف پول از درگاه پرداخت'
        );
      } catch (error) {
        logger.error('خطا در شارژ کیف پول', { error: error.message });
      }
    }
  });
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await eventPublisher.connect();
    await eventSubscriber.connect();
    
    // Seed default data
    const { seedDatabase } = require('./database/seeders/seed');
    await seedDatabase();
    
    setupEventHandlers();

    app.listen(config.port, () => {
      logger.info(`👛 Wallet Service در حال اجرا روی پورت ${config.port}`);
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
