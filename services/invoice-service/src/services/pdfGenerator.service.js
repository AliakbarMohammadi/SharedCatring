const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { toJalali, formatPrice, toPersianDigits, invoiceStatusLabels, invoiceTypeLabels } = require('../utils/helpers');
const logger = require('../utils/logger');

class PDFGeneratorService {
  constructor() {
    this.storagePath = config.storage.path;
    this.ensureStorageDir();
  }

  ensureStorageDir() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async generateInvoicePDF(invoice) {
    return new Promise((resolve, reject) => {
      try {
        const filename = `invoice-${invoice.invoiceNumber}.pdf`;
        const filepath = path.join(this.storagePath, filename);
        
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `فاکتور ${invoice.invoiceNumber}`,
            Author: 'سیستم کترینگ'
          }
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Since we can't use Persian fonts easily, we'll create a simple layout
        // In production, you'd register a Persian font like Vazirmatn
        
        // Header
        doc.fontSize(20)
           .text('INVOICE / FAKTUR', { align: 'center' })
           .moveDown(0.5);

        // Invoice info box
        doc.fontSize(12)
           .text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' })
           .text(`Date: ${toJalali(invoice.createdAt)}`, { align: 'right' })
           .text(`Type: ${invoiceTypeLabels[invoice.type]}`, { align: 'right' })
           .text(`Status: ${invoiceStatusLabels[invoice.status]}`, { align: 'right' })
           .moveDown();

        // Horizontal line
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke()
           .moveDown();

        // Customer info
        doc.fontSize(14)
           .text('Customer Information:', { underline: true })
           .moveDown(0.5);
        
        doc.fontSize(11)
           .text(`Name: ${invoice.customerName || 'N/A'}`)
           .text(`Email: ${invoice.customerEmail || 'N/A'}`)
           .text(`Phone: ${invoice.customerPhone || 'N/A'}`)
           .text(`Address: ${invoice.customerAddress || 'N/A'}`)
           .moveDown();

        // Period info for consolidated invoices
        if (invoice.type === 'consolidated' && invoice.periodStart && invoice.periodEnd) {
          doc.text(`Period: ${toJalali(invoice.periodStart)} - ${toJalali(invoice.periodEnd)}`)
             .moveDown();
        }

        // Items table header
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke()
           .moveDown(0.5);

        const tableTop = doc.y;
        const col1 = 50;   // Row number
        const col2 = 80;   // Description
        const col3 = 350;  // Quantity
        const col4 = 410;  // Unit Price
        const col5 = 480;  // Total

        doc.fontSize(10)
           .text('#', col1, tableTop)
           .text('Description', col2, tableTop)
           .text('Qty', col3, tableTop)
           .text('Unit Price', col4, tableTop)
           .text('Total', col5, tableTop);

        doc.moveTo(50, doc.y + 5)
           .lineTo(545, doc.y + 5)
           .stroke();

        // Items
        let y = doc.y + 15;
        invoice.items?.forEach((item, index) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          
          doc.fontSize(9)
             .text(String(index + 1), col1, y)
             .text(item.description.substring(0, 40), col2, y)
             .text(String(item.quantity), col3, y)
             .text(formatPrice(item.unitPrice, false), col4, y)
             .text(formatPrice(item.totalPrice, false), col5, y);
          
          y += 20;
        });

        // Totals section
        doc.y = y + 20;
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke()
           .moveDown();

        const totalsX = 380;
        doc.fontSize(11)
           .text(`Subtotal:`, totalsX, doc.y)
           .text(formatPrice(invoice.subtotal), 480, doc.y - 11, { align: 'right' })
           .moveDown(0.3);

        if (parseFloat(invoice.discount) > 0) {
          doc.text(`Discount:`, totalsX)
             .text(`-${formatPrice(invoice.discount)}`, 480, doc.y - 11, { align: 'right' })
             .moveDown(0.3);
        }

        doc.text(`Tax (${invoice.taxRate}%):`, totalsX)
           .text(formatPrice(invoice.taxAmount), 480, doc.y - 11, { align: 'right' })
           .moveDown(0.3);

        doc.fontSize(13)
           .text(`TOTAL:`, totalsX)
           .text(formatPrice(invoice.totalAmount), 480, doc.y - 13, { align: 'right' })
           .moveDown();

        if (parseFloat(invoice.paidAmount) > 0) {
          doc.fontSize(11)
             .text(`Paid Amount:`, totalsX)
             .text(formatPrice(invoice.paidAmount), 480, doc.y - 11, { align: 'right' })
             .moveDown(0.3);

          const remaining = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);
          doc.text(`Remaining:`, totalsX)
             .text(formatPrice(remaining), 480, doc.y - 11, { align: 'right' });
        }

        // Due date
        if (invoice.dueDate) {
          doc.moveDown()
             .fontSize(10)
             .text(`Due Date: ${toJalali(invoice.dueDate)}`, { align: 'center' });
        }

        // Notes
        if (invoice.notes) {
          doc.moveDown()
             .fontSize(10)
             .text('Notes:', 50)
             .text(invoice.notes, 50);
        }

        // Footer
        doc.fontSize(8)
           .text('This invoice was generated automatically by Catering System', 50, 780, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          const pdfUrl = `${config.storage.baseUrl}/invoices/${filename}`;
          logger.info('PDF فاکتور ایجاد شد', { invoiceNumber: invoice.invoiceNumber, filepath });
          resolve({ filepath, filename, pdfUrl });
        });

        stream.on('error', reject);
      } catch (error) {
        logger.error('خطا در ایجاد PDF', { error: error.message });
        reject(error);
      }
    });
  }

  getFilePath(filename) {
    return path.join(this.storagePath, filename);
  }
}

module.exports = new PDFGeneratorService();
