const { Invoice, InvoiceItem, InvoiceSequence } = require('../models');
const pdfGenerator = require('./pdfGenerator.service');
const emailService = require('./email.service');
const eventPublisher = require('../events/publisher');
const config = require('../config');
const { generateInvoiceNumber, calculateTax, toJalali, invoiceStatusLabels, invoiceTypeLabels } = require('../utils/helpers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class InvoiceService {
  async getNextSequence(prefix) {
    const [sequence] = await InvoiceSequence.findOrCreate({
      where: { prefix },
      defaults: { prefix, lastSequence: 0 }
    });
    
    sequence.lastSequence += 1;
    await sequence.save();
    
    return sequence.lastSequence;
  }

  async create(invoiceData) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        type = 'instant',
        userId,
        companyId,
        periodStart,
        periodEnd,
        items,
        discount = 0,
        taxRate = config.tax.defaultRate,
        dueDate,
        notes,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress
      } = invoiceData;

      // Calculate totals
      let subtotal = 0;
      const invoiceItems = items.map(item => {
        const totalPrice = parseFloat(item.unitPrice) * item.quantity;
        subtotal += totalPrice;
        return {
          orderId: item.orderId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice
        };
      });

      const taxableAmount = subtotal - parseFloat(discount);
      const taxAmount = calculateTax(taxableAmount, taxRate);
      const totalAmount = taxableAmount + taxAmount;

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(this.getNextSequence.bind(this));

      const invoice = await Invoice.create({
        invoiceNumber,
        type,
        status: 'draft',
        userId,
        companyId,
        periodStart,
        periodEnd,
        subtotal,
        discount,
        taxRate,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        dueDate,
        notes,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress
      }, { transaction });

      // Create invoice items
      for (const item of invoiceItems) {
        await InvoiceItem.create({
          ...item,
          invoiceId: invoice.id
        }, { transaction });
      }

      await transaction.commit();

      // Publish event
      await eventPublisher.publish('invoice.created', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        type: invoice.type,
        totalAmount: invoice.totalAmount,
        userId: invoice.userId,
        companyId: invoice.companyId
      });

      logger.info('فاکتور ایجاد شد', { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber });

      return this.findById(invoice.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(userId, options = {}) {
    const { page = 1, limit = 20, status, type, fromDate, toDate } = options;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{ model: InvoiceItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      invoices: rows.map(inv => this.formatInvoice(inv)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async findById(id) {
    const invoice = await Invoice.findByPk(id, {
      include: [{ model: InvoiceItem, as: 'items' }]
    });

    if (!invoice) {
      throw { statusCode: 404, code: 'ERR_INVOICE_NOT_FOUND', message: 'فاکتور یافت نشد' };
    }

    return this.formatInvoice(invoice);
  }

  async findByInvoiceNumber(invoiceNumber) {
    const invoice = await Invoice.findOne({
      where: { invoiceNumber },
      include: [{ model: InvoiceItem, as: 'items' }]
    });

    if (!invoice) {
      throw { statusCode: 404, code: 'ERR_INVOICE_NOT_FOUND', message: 'فاکتور یافت نشد' };
    }

    return this.formatInvoice(invoice);
  }

  async updateStatus(id, status, userId = null) {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      throw { statusCode: 404, code: 'ERR_INVOICE_NOT_FOUND', message: 'فاکتور یافت نشد' };
    }

    // Check if invoice is paid (immutable)
    if (invoice.status === 'paid') {
      throw { statusCode: 400, code: 'ERR_INVOICE_IMMUTABLE', message: 'فاکتور پرداخت شده قابل تغییر نیست' };
    }

    // Validate status transition
    const validTransitions = {
      draft: ['issued', 'cancelled'],
      issued: ['sent', 'paid', 'cancelled'],
      sent: ['paid', 'cancelled'],
      paid: [],
      cancelled: []
    };

    if (!validTransitions[invoice.status]?.includes(status)) {
      throw {
        statusCode: 400,
        code: 'ERR_INVALID_STATUS_TRANSITION',
        message: `تغییر وضعیت از "${invoiceStatusLabels[invoice.status]}" به "${invoiceStatusLabels[status]}" مجاز نیست`
      };
    }

    const updateData = { status };
    if (status === 'paid') {
      updateData.paidAt = new Date();
      updateData.paidAmount = invoice.totalAmount;
    }

    await invoice.update(updateData);

    // Publish event for paid status
    if (status === 'paid') {
      await eventPublisher.publish('invoice.paid', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        userId: invoice.userId,
        companyId: invoice.companyId
      });
    }

    logger.info('وضعیت فاکتور تغییر کرد', { invoiceId: id, status });

    return this.findById(id);
  }

  async generatePDF(id) {
    const invoice = await this.findById(id);
    
    const { filepath, filename, pdfUrl } = await pdfGenerator.generateInvoicePDF(invoice);

    // Update invoice with PDF URL
    await Invoice.update({ pdfUrl }, { where: { id } });

    return { filepath, filename, pdfUrl };
  }

  async sendInvoice(id) {
    const invoice = await Invoice.findByPk(id, {
      include: [{ model: InvoiceItem, as: 'items' }]
    });

    if (!invoice) {
      throw { statusCode: 404, code: 'ERR_INVOICE_NOT_FOUND', message: 'فاکتور یافت نشد' };
    }

    if (!invoice.customerEmail) {
      throw { statusCode: 400, code: 'ERR_NO_EMAIL', message: 'ایمیل مشتری ثبت نشده است' };
    }

    // Generate PDF if not exists
    let pdfPath = null;
    if (!invoice.pdfUrl) {
      const { filepath, pdfUrl } = await pdfGenerator.generateInvoicePDF(this.formatInvoice(invoice));
      await invoice.update({ pdfUrl });
      pdfPath = filepath;
    } else {
      pdfPath = pdfGenerator.getFilePath(`invoice-${invoice.invoiceNumber}.pdf`);
    }

    // Send email
    await emailService.sendInvoiceEmail(
      this.formatInvoice(invoice),
      invoice.customerEmail,
      pdfPath
    );

    // Update status to sent if currently issued
    if (invoice.status === 'issued') {
      await invoice.update({ status: 'sent' });
    }

    // Publish event
    await eventPublisher.publish('invoice.sent', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      email: invoice.customerEmail
    });

    logger.info('فاکتور ارسال شد', { invoiceId: id, email: invoice.customerEmail });

    return this.findById(id);
  }

  // Company methods
  async getCompanyInvoices(companyId, options = {}) {
    const { page = 1, limit = 20, status, type, fromDate, toDate } = options;
    const offset = (page - 1) * limit;

    const where = { companyId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{ model: InvoiceItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      invoices: rows.map(inv => this.formatInvoice(inv)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async generateConsolidatedInvoice(companyId, periodStart, periodEnd, orders, companyInfo) {
    const items = orders.map(order => ({
      orderId: order.id,
      description: `سفارش ${order.orderNumber} - ${toJalali(order.deliveryDate)}`,
      quantity: 1,
      unitPrice: order.totalAmount
    }));

    return this.create({
      type: 'consolidated',
      companyId,
      periodStart,
      periodEnd,
      items,
      customerName: companyInfo.name,
      customerEmail: companyInfo.email,
      customerPhone: companyInfo.phone,
      customerAddress: companyInfo.address,
      notes: `فاکتور تجمیعی دوره ${toJalali(periodStart)} تا ${toJalali(periodEnd)}`
    });
  }

  async previewConsolidatedInvoice(companyId, periodStart, periodEnd, orders, companyInfo) {
    let subtotal = 0;
    const items = orders.map(order => {
      subtotal += parseFloat(order.totalAmount);
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        description: `سفارش ${order.orderNumber} - ${toJalali(order.deliveryDate)}`,
        quantity: 1,
        unitPrice: parseFloat(order.totalAmount),
        totalPrice: parseFloat(order.totalAmount)
      };
    });

    const taxAmount = calculateTax(subtotal);
    const totalAmount = subtotal + taxAmount;

    return {
      type: 'consolidated',
      companyId,
      periodStart,
      periodEnd,
      periodStartJalali: toJalali(periodStart),
      periodEndJalali: toJalali(periodEnd),
      customerName: companyInfo.name,
      customerEmail: companyInfo.email,
      items,
      subtotal,
      discount: 0,
      taxRate: config.tax.defaultRate,
      taxAmount,
      totalAmount,
      orderCount: orders.length
    };
  }

  // Create instant invoice from order
  async createFromOrder(orderData) {
    const items = orderData.items.map(item => ({
      orderId: orderData.orderId,
      description: item.foodName,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));

    return this.create({
      type: 'instant',
      userId: orderData.userId,
      companyId: orderData.companyId,
      items,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      notes: `فاکتور سفارش ${orderData.orderNumber}`
    });
  }

  formatInvoice(invoice) {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      typeLabel: invoiceTypeLabels[invoice.type],
      status: invoice.status,
      statusLabel: invoiceStatusLabels[invoice.status],
      userId: invoice.userId,
      companyId: invoice.companyId,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      periodStartJalali: toJalali(invoice.periodStart),
      periodEndJalali: toJalali(invoice.periodEnd),
      subtotal: parseFloat(invoice.subtotal),
      discount: parseFloat(invoice.discount),
      taxRate: parseFloat(invoice.taxRate),
      taxAmount: parseFloat(invoice.taxAmount),
      totalAmount: parseFloat(invoice.totalAmount),
      paidAmount: parseFloat(invoice.paidAmount),
      remainingAmount: parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount),
      dueDate: invoice.dueDate,
      dueDateJalali: toJalali(invoice.dueDate),
      paidAt: invoice.paidAt,
      paidAtJalali: toJalali(invoice.paidAt),
      pdfUrl: invoice.pdfUrl,
      notes: invoice.notes,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      customerAddress: invoice.customerAddress,
      createdAt: invoice.createdAt,
      createdAtJalali: toJalali(invoice.createdAt),
      updatedAt: invoice.updatedAt,
      items: invoice.items?.map(item => ({
        id: item.id,
        orderId: item.orderId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.totalPrice)
      }))
    };
  }
}

module.exports = new InvoiceService();
