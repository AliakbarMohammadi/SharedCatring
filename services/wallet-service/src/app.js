const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const walletRoutes = require('./api/routes/v1/walletRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'wallet-service', status: 'healthy', timestamp: new Date().toISOString() },
    message: 'سرویس در حال اجرا است'
  });
});

app.use('/api/v1/wallets', walletRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'ERR_1002', message: 'مسیر درخواستی یافت نشد', details: [] }
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.errorCode || 'ERR_1000', message: err.message || 'خطای داخلی سرور', details: [] }
  });
});

const startServer = async () => {
  await connectDatabase();
  app.listen(config.port, () => console.log(`Wallet Service running on port ${config.port}`));
};

startServer();
module.exports = app;
