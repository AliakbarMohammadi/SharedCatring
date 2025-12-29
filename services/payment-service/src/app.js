const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const config = {
  port: parseInt(process.env.PORT, 10) || 3008
};

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'payment-service', status: 'healthy', timestamp: new Date().toISOString() },
    message: 'سرویس در حال اجرا است'
  });
});

// Payment routes
app.post('/api/v1/payments/initiate', async (req, res) => {
  const { orderId, amount, method, callbackUrl } = req.body;
  const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  res.json({
    success: true,
    data: {
      paymentId,
      orderId,
      amount,
      method,
      status: 'pending',
      gatewayUrl: method === 'card' ? `https://gateway.example.com/pay/${paymentId}` : null
    },
    message: 'درخواست پرداخت ایجاد شد'
  });
});

app.post('/api/v1/payments/verify', async (req, res) => {
  const { paymentId, transactionId } = req.body;
  
  res.json({
    success: true,
    data: {
      paymentId,
      transactionId,
      status: 'completed',
      verifiedAt: new Date().toISOString()
    },
    message: 'پرداخت با موفقیت تأیید شد'
  });
});

app.get('/api/v1/payments/:id', async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      status: 'completed',
      amount: 150000,
      method: 'wallet'
    },
    message: 'اطلاعات پرداخت دریافت شد'
  });
});

app.post('/api/v1/payments/:id/refund', async (req, res) => {
  const { amount, reason } = req.body;
  
  res.json({
    success: true,
    data: {
      paymentId: req.params.id,
      refundId: `REF${Date.now()}`,
      amount,
      status: 'refunded'
    },
    message: 'مبلغ با موفقیت بازگردانده شد'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'مسیر یافت نشد', details: [] } });
});

app.listen(config.port, () => console.log(`Payment Service running on port ${config.port}`));
module.exports = app;
