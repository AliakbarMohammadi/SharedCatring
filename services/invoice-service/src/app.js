const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const config = { port: parseInt(process.env.PORT, 10) || 3007 };

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'invoice-service', status: 'healthy', timestamp: new Date().toISOString() },
    message: 'سرویس در حال اجرا است'
  });
});

// Invoice routes
app.post('/api/v1/invoices', async (req, res) => {
  const { orderId, companyId, items, dueDate } = req.body;
  const invoiceNumber = `INV${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;
  
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.09;
  const total = subtotal + tax;

  res.status(201).json({
    success: true,
    data: {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      orderId,
      companyId,
      items,
      subtotal,
      tax,
      total,
      status: 'issued',
      dueDate,
      issuedAt: new Date().toISOString()
    },
    message: 'فاکتور با موفقیت ایجاد شد'
  });
});

app.get('/api/v1/invoices', async (req, res) => {
  const { companyId, status, page = 1, limit = 10 } = req.query;
  
  res.json({
    success: true,
    data: [],
    message: 'فاکتورها با موفقیت دریافت شد',
    meta: { page: parseInt(page), limit: parseInt(limit), total: 0 }
  });
});

app.get('/api/v1/invoices/:id', async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      invoiceNumber: 'INV202401001',
      status: 'issued',
      total: 500000
    },
    message: 'فاکتور با موفقیت دریافت شد'
  });
});

app.patch('/api/v1/invoices/:id/pay', async (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, status: 'paid', paidAt: new Date().toISOString() },
    message: 'فاکتور با موفقیت پرداخت شد'
  });
});

app.get('/api/v1/invoices/:id/pdf', async (req, res) => {
  res.json({
    success: true,
    data: { downloadUrl: `/files/invoices/${req.params.id}.pdf` },
    message: 'لینک دانلود فاکتور'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'مسیر یافت نشد', details: [] } });
});

app.listen(config.port, () => console.log(`Invoice Service running on port ${config.port}`));
module.exports = app;
