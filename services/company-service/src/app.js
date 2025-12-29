const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const config = { port: parseInt(process.env.PORT, 10) || 3004 };

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'company-service', status: 'healthy', timestamp: new Date().toISOString() },
    message: 'سرویس در حال اجرا است'
  });
});

// Company routes
app.post('/api/v1/companies', async (req, res) => {
  const { name, nameEn, registrationNumber, address, phone, email, adminUserId } = req.body;
  
  res.status(201).json({
    success: true,
    data: {
      id: `comp_${Date.now()}`,
      name,
      nameEn,
      registrationNumber,
      address,
      phone,
      email,
      adminUserId,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    message: 'شرکت با موفقیت ایجاد شد'
  });
});

app.get('/api/v1/companies', async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  res.json({
    success: true,
    data: [],
    message: 'شرکت‌ها با موفقیت دریافت شد',
    meta: { page: parseInt(page), limit: parseInt(limit), total: 0 }
  });
});

app.get('/api/v1/companies/:id', async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      name: 'شرکت نمونه',
      nameEn: 'Sample Company',
      status: 'active',
      employeeCount: 50
    },
    message: 'اطلاعات شرکت دریافت شد'
  });
});

app.put('/api/v1/companies/:id', async (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, ...req.body, updatedAt: new Date().toISOString() },
    message: 'اطلاعات شرکت با موفقیت به‌روزرسانی شد'
  });
});

app.patch('/api/v1/companies/:id/status', async (req, res) => {
  const { status } = req.body;
  res.json({
    success: true,
    data: { id: req.params.id, status },
    message: 'وضعیت شرکت با موفقیت تغییر کرد'
  });
});

// Department routes
app.post('/api/v1/companies/:companyId/departments', async (req, res) => {
  const { name, managerId } = req.body;
  res.status(201).json({
    success: true,
    data: { id: `dept_${Date.now()}`, companyId: req.params.companyId, name, managerId },
    message: 'دپارتمان با موفقیت ایجاد شد'
  });
});

app.get('/api/v1/companies/:companyId/departments', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'دپارتمان‌ها دریافت شد'
  });
});

// Subscription routes
app.get('/api/v1/companies/:id/subscription', async (req, res) => {
  res.json({
    success: true,
    data: {
      companyId: req.params.id,
      plan: 'enterprise',
      maxEmployees: 500,
      currentEmployees: 50,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    message: 'اطلاعات اشتراک دریافت شد'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'مسیر یافت نشد', details: [] } });
});

app.listen(config.port, () => console.log(`Company Service running on port ${config.port}`));
module.exports = app;
