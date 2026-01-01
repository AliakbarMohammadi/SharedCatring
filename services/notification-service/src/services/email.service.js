const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Email Service - Production Ready
 * سرویس ایمیل - آماده تولید
 * 
 * پشتیبانی از SMTP واقعی برای ارسال ایمیل
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
    // Only create transporter if SMTP is configured
    if (config.smtp.host && config.smtp.user) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure || config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass
        },
        tls: {
          rejectUnauthorized: false // For self-signed certificates
        }
      });

      // Verify connection
      this.transporter.verify((error) => {
        if (error) {
          logger.warn('⚠️ اتصال SMTP برقرار نشد', { error: error.message });
        } else {
          logger.info('✅ اتصال SMTP برقرار شد');
        }
      });
    } else {
      logger.warn('⚠️ تنظیمات SMTP ناقص است. ایمیل‌ها در کنسول ثبت می‌شوند');
    }
  }

  /**
   * Send email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body (HTML)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  async send(to, subject, body, options = {}) {
    try {
      const mailOptions = {
        from: config.smtp.from,
        to,
        subject,
        html: this.wrapInTemplate(body, subject),
        ...options
      };

      // Check if mock mode is enabled
      if (config.features?.mockEmail) {
        return this.sendConsole(to, subject, body);
      }

      // Check if transporter is available
      if (!this.transporter) {
        logger.warn('SMTP transporter not available, logging to console');
        return this.sendConsole(to, subject, body);
      }

      // Send real email
      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('📧 ایمیل ارسال شد', { 
        to, 
        subject,
        messageId: result.messageId 
      });
      
      return { 
        success: true, 
        messageId: result.messageId,
        provider: 'smtp'
      };
    } catch (error) {
      logger.error('خطا در ارسال ایمیل', { 
        error: error.message, 
        to,
        subject 
      });
      
      // Return failure but don't throw - notification failures shouldn't break the flow
      return { 
        success: false, 
        error: error.message,
        provider: 'smtp'
      };
    }
  }

  /**
   * Console logging mode (for development/testing)
   * @param {string} to 
   * @param {string} subject 
   * @param {string} body 
   * @returns {Promise<Object>}
   */
  async sendConsole(to, subject, body) {
    const messageId = `console-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('📧 ایمیل (کنسول)', { 
      to, 
      subject,
      bodyPreview: body.substring(0, 100) + '...',
      messageId
    });
    
    return { 
      success: true, 
      messageId,
      provider: 'console',
      note: 'ایمیل در کنسول ثبت شد'
    };
  }

  /**
   * Send welcome email
   * @param {string} to 
   * @param {string} name 
   * @returns {Promise<Object>}
   */
  async sendWelcome(to, name) {
    const body = `
      <h2>سلام ${name} عزیز! 👋</h2>
      <p>به سیستم کترینگ خوش آمدید.</p>
      <p>اکنون می‌توانید از امکانات زیر استفاده کنید:</p>
      <ul>
        <li>مشاهده منوی روزانه و هفتگی</li>
        <li>ثبت سفارش غذا</li>
        <li>پیگیری وضعیت سفارشات</li>
        <li>مدیریت کیف پول</li>
      </ul>
      <div class="highlight">
        <p>برای شروع، وارد حساب کاربری خود شوید و منوی امروز را مشاهده کنید.</p>
      </div>
    `;
    return this.send(to, 'خوش آمدید به سیستم کترینگ 🍽️', body);
  }

  /**
   * Send order confirmation email
   * @param {string} to 
   * @param {Object} order 
   * @returns {Promise<Object>}
   */
  async sendOrderConfirmation(to, order) {
    const itemsList = order.items?.map(item => 
      `<li>${item.foodName} - ${item.quantity} عدد - ${item.totalPrice?.toLocaleString('fa-IR')} تومان</li>`
    ).join('') || '';

    const body = `
      <h2>سفارش شما ثبت شد ✅</h2>
      <div class="highlight">
        <p><strong>شماره سفارش:</strong> ${order.orderNumber}</p>
        <p><strong>تاریخ تحویل:</strong> ${order.deliveryDate}</p>
        <p><strong>زمان تحویل:</strong> ${order.deliveryTimeSlot || 'نامشخص'}</p>
      </div>
      <h3>جزئیات سفارش:</h3>
      <ul>${itemsList}</ul>
      <p><strong>مبلغ کل:</strong> ${order.totalAmount?.toLocaleString('fa-IR')} تومان</p>
    `;
    return this.send(to, `سفارش ${order.orderNumber} ثبت شد`, body);
  }

  /**
   * Send password reset email
   * @param {string} to 
   * @param {string} resetLink 
   * @returns {Promise<Object>}
   */
  async sendPasswordReset(to, resetLink) {
    const body = `
      <h2>بازیابی رمز عبور 🔐</h2>
      <p>درخواست بازیابی رمز عبور برای حساب شما ثبت شده است.</p>
      <p>برای تغییر رمز عبور، روی دکمه زیر کلیک کنید:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="btn">تغییر رمز عبور</a>
      </p>
      <p style="color: #888; font-size: 12px;">
        این لینک تا ۱ ساعت معتبر است. اگر شما این درخواست را ثبت نکرده‌اید، این ایمیل را نادیده بگیرید.
      </p>
    `;
    return this.send(to, 'بازیابی رمز عبور', body);
  }

  /**
   * Wrap email body in HTML template
   * @param {string} body 
   * @param {string} title 
   * @returns {string}
   */
  wrapInTemplate(body, title) {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Tahoma, Arial, sans-serif;
      direction: rtl;
      text-align: right;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
      line-height: 1.8;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 25px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      color: #888;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
    .btn {
      display: inline-block;
      background-color: #4CAF50;
      color: white !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 15px 0;
    }
    .highlight {
      background-color: #e8f5e9;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    ul {
      padding-right: 20px;
    }
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ سیستم کترینگ</h1>
    </div>
    <div class="content">
      ${body}
    </div>
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
