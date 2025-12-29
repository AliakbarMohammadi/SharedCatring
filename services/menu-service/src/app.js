const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const menuRoutes = require('./api/routes/v1/menuRoutes');

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'menu-service',
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    message: 'سرویس در حال اجرا است'
  });
});

// API routes
app.use('/api/v1/menus', menuRoutes);

// 404 handler
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'ERR_1000';
  const message = err.message || 'خطای داخلی سرور';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details: err.details || []
    }
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Menu Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
