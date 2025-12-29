const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const config = { port: parseInt(process.env.PORT, 10) || 3002 };

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'identity-service', status: 'healthy', timestamp: new Date().toISOString() },
    message: 'سرویس در حال اجرا است'
  });
});

// Role routes
app.get('/api/v1/identity/roles', async (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'super_admin', name: 'مدیر ارشد', permissions: ['*'] },
      { id: 'company_admin', name: 'مدیر شرکت', permissions: ['company.*', 'user.read', 'order.*'] },
      { id: 'company_manager', name: 'مدیر بخش', permissions: ['order.*', 'menu.read', 'report.read'] },
      { id: 'employee', name: 'کارمند', permissions: ['order.create', 'order.read.own', 'menu.read'] },
      { id: 'kitchen_staff', name: 'پرسنل آشپزخانه', permissions: ['order.read', 'order.update.status'] },
      { id: 'delivery_staff', name: 'پرسنل تحویل', permissions: ['order.read', 'order.update.delivery'] }
    ],
    message: 'نقش‌ها دریافت شد'
  });
});

app.get('/api/v1/identity/roles/:id', async (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, name: 'نقش نمونه', permissions: [] },
    message: 'نقش دریافت شد'
  });
});

app.post('/api/v1/identity/roles', async (req, res) => {
  const { name, permissions } = req.body;
  res.status(201).json({
    success: true,
    data: { id: `role_${Date.now()}`, name, permissions },
    message: 'نقش با موفقیت ایجاد شد'
  });
});

// Permission routes
app.get('/api/v1/identity/permissions', async (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'user.create', name: 'ایجاد کاربر', group: 'user' },
      { id: 'user.read', name: 'مشاهده کاربران', group: 'user' },
      { id: 'user.update', name: 'ویرایش کاربر', group: 'user' },
      { id: 'user.delete', name: 'حذف کاربر', group: 'user' },
      { id: 'order.create', name: 'ثبت سفارش', group: 'order' },
      { id: 'order.read', name: 'مشاهده سفارشات', group: 'order' },
      { id: 'menu.read', name: 'مشاهده منو', group: 'menu' },
      { id: 'menu.manage', name: 'مدیریت منو', group: 'menu' }
    ],
    message: 'دسترسی‌ها دریافت شد'
  });
});

// User role assignment
app.post('/api/v1/identity/users/:userId/roles', async (req, res) => {
  const { roleId } = req.body;
  res.json({
    success: true,
    data: { userId: req.params.userId, roleId },
    message: 'نقش به کاربر اختصاص یافت'
  });
});

app.get('/api/v1/identity/users/:userId/permissions', async (req, res) => {
  res.json({
    success: true,
    data: {
      userId: req.params.userId,
      role: 'employee',
      permissions: ['order.create', 'order.read.own', 'menu.read']
    },
    message: 'دسترسی‌های کاربر دریافت شد'
  });
});

// Check permission
app.post('/api/v1/identity/check-permission', async (req, res) => {
  const { userId, permission, resource } = req.body;
  res.json({
    success: true,
    data: { allowed: true },
    message: 'بررسی دسترسی انجام شد'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'مسیر یافت نشد', details: [] } });
});

app.listen(config.port, () => console.log(`Identity Service running on port ${config.port}`));
module.exports = app;
