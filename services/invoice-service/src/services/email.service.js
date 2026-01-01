const nodemailer = require('nodemailer');
const fs = require('fs');
const config = require('../config');
const { toJalali, formatPrice, invoiceTypeLabels } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Invoice Email Service - Production Ready
 * سرویس ایمیل فاکتور - آماده تولید
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * Initialize email transporter
   */
  initTransporter() {
    if (config.smtp?.host && config.smtp?.user) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure || config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.transporter.verify((error) => {
        if (error) {
          logger.warn('⚠️ اتصال SMTP برقرار نشد', { error: error.message });
        } else {
          logger.info('✅ اتصال SMTP برقرار شد');
        }
      });
    } else {
      logger.warn('⚠️ تنظیمات SMTP ناقص است');
    }
  }

  async sendInvoiceEmail(invoice, recipientEmail, pdfPath) {
    try {
      const subject = `فاکتور سفارش شما - شماره ${invoice.invoiceNumber}`;
      const html = this.generateInvoiceEmailTemplate(invoice);

      const attachments = [];
      if (pdfPath && fs.existsSync(pdfPath)) {
        attachments.push({
          filename: `فاکتور-${invoice.invoiceNumber}.pdf`,
          path: pdfPath
        });
      }

      const mailOptions = {
        from: config.smtp?.from || 'سیستم کترینگ <noreply@catering.ir>',
        to: recipientEmail,
        subject,
        html,
        attachments
      };

      // Check if transporter is available
      if (!this.transporter) {
        logger.info('📧 ایمیل فاکتور (کنسول)', { 
          to: recipientEmail, 
          subject,
          invoiceNumber: invoice.invoiceNumber 
        });
        return { success: true, messageId: `console-${Date.now()}`, provider: 'console' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('📧 ایمیل فاکتور ارسال شد', { 
        to: recipientEmail, 
        messageId: result.messageId,
        invoiceNumber: invoice.invoiceNumber 
      });

      return { success: true, messageId: result.messageId, provider: 'smtp' };
    } catch (error) {
      logger.error('خطا در ارسال ایمیل فاکتور', { 
        error: error.message,
        invoiceNumber: invoice.invoiceNumber 
      });
      // Return failure but don't throw - notification failures shouldn't break the flow
      return { success: false, error: error.message };
    }
  }

  generateInvoiceEmailTemplate(invoice) {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Tahoma, Arial, sans-serif;
      direction: rtl;
      text-align: right;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 30px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #333;
      margin: 0;
    }
    .invoice-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .invoice-info p {
      margin: 5px 0;
      color: #555;
    }
    .amount-box {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      border-radius: 5px;
      text-align: center;
      margin: 20px 0;
    }
    .amount-box .label {
      font-size: 14px;
      margin-bottom: 5px;
    }
    .amount-box .amount {
      font-size: 28px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      color: #888;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .btn {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ سیستم کترینگ</h1>
      <p>فاکتور سفارش شما</p>
    </div>
    
    <p>با سلام و احترام،</p>
    <p>فاکتور سفارش شما با مشخصات زیر صادر شده است:</p>
    
    <div class="invoice-info">
      <p><strong>شماره فاکتور:</strong> ${invoice.invoiceNumber}</p>
      <p><strong>نوع فاکتور:</strong> ${invoiceTypeLabels[invoice.type] || invoice.type}</p>
      <p><strong>تاریخ صدور:</strong> ${toJalali(invoice.createdAt)}</p>
      ${invoice.dueDate ? `<p><strong>تاریخ سررسید:</strong> ${toJalali(invoice.dueDate)}</p>` : ''}
    </div>
    
    <div class="amount-box">
      <div class="label">مبلغ کل فاکتور</div>
      <div class="amount">${formatPrice(invoice.totalAmount)}</div>
    </div>
    
    <p>فایل PDF فاکتور به این ایمیل پیوست شده است.</p>
    
    <p>در صورت داشتن هرگونه سؤال، با پشتیبانی تماس بگیرید.</p>
    
    <div class="footer">
      <p>این ایمیل به صورت خودکار ارسال شده است.</p>
      <p>© سیستم کترینگ - تمامی حقوق محفوظ است</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

module.exports = new EmailService();
