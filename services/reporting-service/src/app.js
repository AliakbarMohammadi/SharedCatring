const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const config = { port: parseInt(process.env.PORT, 10) || 3011 };

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'reporting-service', status: 'healthy', timestamp: new Date().toISOString() },
    message: 'سرویس در حال اجرا است'
  });
});

// Dashboard stats
app.get('/api/v1/reports/dashboard', async (req, res) => {
  const companyId = req.headers['x-company-id'];
  
  res.json({
    success: true,
    data: {
      todayOrders: 45,
      todayRevenue: 12500000,
      activeUsers: 120,
      pendingOrders: 8,
      weeklyTrend: [
        { date: '۱۴۰۲/۱۰/۰۱', orders: 42, revenue: 11000000 },
        { date: '۱۴۰۲/۱۰/۰۲', orders: 38, revenue: 9500000 },
        { date: '۱۴۰۲/۱۰/۰۳', orders: 51, revenue: 13200000 }
      ]
    },
    message: 'آمار داشبورد دریافت شد'
  });
});

// Order reports
app.get('/api/v1/reports/orders', async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  res.json({
    success: true,
    data: {
      summary: {
        totalOrders: 450,
        totalRevenue: 125000000,
        averageOrderValue: 277778,
        cancelledOrders: 12
      },
      breakdown: []
    },
    message: 'گزارش سفارشات دریافت شد'
  });
});

// Menu popularity report
app.get('/api/v1/reports/menu-popularity', async (req, res) => {
  const { startDate, endDate, limit = 10 } = req.query;
  
  res.json({
    success: true,
    data: [
      { menuItemId: '1', name: 'چلو کباب کوبیده', orderCount: 156, revenue: 23400000 },
      { menuItemId: '2', name: 'جوجه کباب', orderCount: 134, revenue: 18760000 },
      { menuItemId: '3', name: 'قورمه سبزی', orderCount: 98, revenue: 9800000 }
    ],
    message: 'گزارش محبوبیت منو دریافت شد'
  });
});

// Financial report
app.get('/api/v1/reports/financial', async (req, res) => {
  const { startDate, endDate } = req.query;
  
  res.json({
    success: true,
    data: {
      totalRevenue: 125000000,
      totalRefunds: 2500000,
      netRevenue: 122500000,
      paymentMethods: {
        wallet: { count: 320, amount: 85000000 },
        card: { count: 100, amount: 35000000 },
        cash: { count: 30, amount: 5000000 }
      }
    },
    message: 'گزارش مالی دریافت شد'
  });
});

// User activity report
app.get('/api/v1/reports/user-activity', async (req, res) => {
  const { startDate, endDate } = req.query;
  
  res.json({
    success: true,
    data: {
      activeUsers: 120,
      newUsers: 15,
      topUsers: [
        { userId: '1', name: 'علی محمدی', orderCount: 22, totalSpent: 3300000 },
        { userId: '2', name: 'مریم احمدی', orderCount: 18, totalSpent: 2700000 }
      ]
    },
    message: 'گزارش فعالیت کاربران دریافت شد'
  });
});

// Export report
app.post('/api/v1/reports/export', async (req, res) => {
  const { reportType, format, startDate, endDate } = req.body;
  
  res.json({
    success: true,
    data: {
      downloadUrl: `/files/reports/report_${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    message: 'گزارش آماده دانلود است'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'مسیر یافت نشد', details: [] } });
});

app.listen(config.port, () => console.log(`Reporting Service running on port ${config.port}`));
module.exports = app;
