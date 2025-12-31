const { invoiceService } = require('../../services');
const logger = require('../../utils/logger');
const config = require('../../config');
const axios = require('axios');

// Service clients
const orderClient = axios.create({
  baseURL: config.services.order,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

const companyClient = axios.create({
  baseURL: config.services.company,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

class InvoiceController {
  // Create new invoice
  async create(req, res, next) {
    try {
      const invoiceData = {
        ...req.body,
        userId: req.user.id
      };
      
      const invoice = await invoiceService.create(invoiceData);
      
      res.status(201).json({
        success: true,
        data: invoice,
        message: 'فاکتور با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all invoices for user
  async findAll(req, res, next) {
    try {
      const result = await invoiceService.findAll(req.user.id, req.query);
      
      res.json({
        success: true,
        data: result.invoices,
        message: 'فاکتورها با موفقیت دریافت شد',
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Get invoice by ID
  async findById(req, res, next) {
    try {
      const invoice = await invoiceService.findById(req.params.id);
      
      res.json({
        success: true,
        data: invoice,
        message: 'فاکتور با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get invoice by number
  async findByNumber(req, res, next) {
    try {
      const invoice = await invoiceService.findByInvoiceNumber(req.params.invoiceNumber);
      
      res.json({
        success: true,
        data: invoice,
        message: 'فاکتور با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update invoice status
  async updateStatus(req, res, next) {
    try {
      const invoice = await invoiceService.updateStatus(
        req.params.id,
        req.body.status,
        req.user.id
      );
      
      res.json({
        success: true,
        data: invoice,
        message: 'وضعیت فاکتور با موفقیت تغییر کرد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate PDF
  async generatePDF(req, res, next) {
    try {
      const result = await invoiceService.generatePDF(req.params.id);
      
      res.json({
        success: true,
        data: {
          pdfUrl: result.pdfUrl,
          filename: result.filename
        },
        message: 'فایل PDF فاکتور ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Download PDF
  async downloadPDF(req, res, next) {
    try {
      const { filepath, filename } = await invoiceService.generatePDF(req.params.id);
      
      res.download(filepath, filename, (err) => {
        if (err) {
          logger.error('خطا در دانلود PDF', { error: err.message });
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Send invoice via email
  async sendInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.sendInvoice(req.params.id);
      
      res.json({
        success: true,
        data: invoice,
        message: 'فاکتور با موفقیت ارسال شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get company invoices
  async getCompanyInvoices(req, res, next) {
    try {
      const result = await invoiceService.getCompanyInvoices(
        req.params.companyId,
        req.query
      );
      
      res.json({
        success: true,
        data: result.invoices,
        message: 'فاکتورهای شرکت با موفقیت دریافت شد',
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Preview consolidated invoice
  async previewConsolidated(req, res, next) {
    try {
      const { companyId, periodStart, periodEnd } = req.body;
      
      // Fetch orders from Order Service
      let orders = [];
      try {
        const ordersResponse = await orderClient.get('/api/v1/orders/company/' + companyId, {
          params: { startDate: periodStart, endDate: periodEnd, status: 'completed' },
          headers: { 'X-User-ID': req.user?.id, 'X-User-Role': 'admin' }
        });
        orders = ordersResponse.data.data || [];
      } catch (error) {
        logger.warn('خطا در دریافت سفارشات از Order Service', { error: error.message });
      }
      
      // Fetch company info from Company Service
      let companyInfo = { name: 'شرکت', email: '', phone: '', address: '' };
      try {
        const companyResponse = await companyClient.get('/api/v1/companies/' + companyId, {
          headers: { 'X-User-ID': req.user?.id, 'X-User-Role': 'admin' }
        });
        const company = companyResponse.data.data;
        companyInfo = {
          name: company.name,
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || ''
        };
      } catch (error) {
        logger.warn('خطا در دریافت اطلاعات شرکت', { error: error.message });
      }
      
      const preview = await invoiceService.previewConsolidatedInvoice(
        companyId,
        periodStart,
        periodEnd,
        orders,
        companyInfo
      );
      
      res.json({
        success: true,
        data: preview,
        message: 'پیش‌نمایش فاکتور تجمیعی'
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate consolidated invoice
  async generateConsolidated(req, res, next) {
    try {
      const { companyId, periodStart, periodEnd } = req.body;
      
      // Fetch orders from Order Service
      let orders = [];
      try {
        const ordersResponse = await orderClient.get('/api/v1/orders/company/' + companyId, {
          params: { startDate: periodStart, endDate: periodEnd, status: 'completed' },
          headers: { 'X-User-ID': req.user?.id, 'X-User-Role': 'admin' }
        });
        orders = ordersResponse.data.data || [];
      } catch (error) {
        logger.warn('خطا در دریافت سفارشات از Order Service', { error: error.message });
      }
      
      // Fetch company info from Company Service
      let companyInfo = { name: 'شرکت', email: '', phone: '', address: '' };
      try {
        const companyResponse = await companyClient.get('/api/v1/companies/' + companyId, {
          headers: { 'X-User-ID': req.user?.id, 'X-User-Role': 'admin' }
        });
        const company = companyResponse.data.data;
        companyInfo = {
          name: company.name,
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || ''
        };
      } catch (error) {
        logger.warn('خطا در دریافت اطلاعات شرکت', { error: error.message });
      }
      
      const invoice = await invoiceService.generateConsolidatedInvoice(
        companyId,
        periodStart,
        periodEnd,
        orders,
        companyInfo
      );
      
      res.status(201).json({
        success: true,
        data: invoice,
        message: 'فاکتور تجمیعی با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
