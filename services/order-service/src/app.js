const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const orderRoutes = require('./api/routes/v1/orderRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'order-service',
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    message: 'سرویس در حال اجرا است'
  });
});

app.use('/api/v1/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_1002',
      message: 'مسیر درخواستی یافت نشد',
      details: []
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'ERR_1000';
  const message = err.message || 'خطای داخلی سرور';

  res.status(statusCode).json({
    success: false,
    error: { code: errorCode, message, details: err.details || [] }
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Order Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
