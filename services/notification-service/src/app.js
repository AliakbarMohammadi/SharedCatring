const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const config = { port: parseInt(process.env.PORT, 10) || 3010 };

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'notification-service', status: 'healthy', timestamp: new Date().toISOString() },
    message: 'سرویس در حال اجرا است'
  });
});

// Notification routes
app.post('/api/v1/notifications/send', async (req, res) => {
  const { userId, type, channel, title, message, data } = req.body;
  
  res.status(201).json({
    success: true,
    data: {
      id: `notif_${Date.now()}`,
      userId,
      type,
      channel,
      title,
      message,
      status: 'sent',
      sentAt: new Date().toISOString()
    },
    message: 'اعلان با موفقیت ارسال شد'
  });
});

app.post('/api/v1/notifications/send-bulk', async (req, res) => {
  const { userIds, type, channel, title, message } = req.body;
  
  res.status(201).json({
    success: true,
    data: {
      totalSent: userIds.length,
      failed: 0
    },
    message: 'اعلان‌ها با موفقیت ارسال شد'
  });
});

app.get('/api/v1/notifications', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { page = 1, limit = 10, unreadOnly } = req.query;
  
  res.json({
    success: true,
    data: [],
    message: 'اعلان‌ها با موفقیت دریافت شد',
    meta: { page: parseInt(page), limit: parseInt(limit), total: 0, unreadCount: 0 }
  });
});

app.patch('/api/v1/notifications/:id/read', async (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, isRead: true, readAt: new Date().toISOString() },
    message: 'اعلان خوانده شد'
  });
});

app.patch('/api/v1/notifications/read-all', async (req, res) => {
  res.json({
    success: true,
    data: { markedAsRead: 0 },
    message: 'همه اعلان‌ها خوانده شد'
  });
});

app.delete('/api/v1/notifications/:id', async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'اعلان حذف شد'
  });
});

// Templates
app.get('/api/v1/notifications/templates', async (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'order_confirmed', name: 'تأیید سفارش', channel: ['sms', 'push'] },
      { id: 'order_ready', name: 'آماده تحویل', channel: ['sms', 'push'] },
      { id: 'payment_success', name: 'پرداخت موفق', channel: ['sms', 'email'] }
    ],
    message: 'قالب‌ها دریافت شد'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'مسیر یافت نشد', details: [] } });
});

app.listen(config.port, () => console.log(`Notification Service running on port ${config.port}`));
module.exports = app;
