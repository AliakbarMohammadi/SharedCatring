const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  }

  async send(to, subject, body, options = {}) {
    try {
      const mailOptions = {
        from: config.smtp.from,
        to,
        subject,
        html: this.wrapInTemplate(body, subject),
        ...options
      };

      // In development, just log instead of sending
      if (config.env === 'development') {
        logger.info('📧 ایمیل (شبیه‌سازی)', { 
          to, 
          subject,
          bodyPreview: body.substring(0, 100) + '...'
        });
        return { 
          success: true, 
          messageId: `dev-${Date.now()}`,
          simulated: true 
        };
      }

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('📧 ایمیل ارسال شد', { to, messageId: result.messageId });
      
      return { 
        success: true, 
        messageId: result.messageId 
      };
    } catch (error) {
      logger.error('خطا در ارسال ایمیل', { error: error.message, to });
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  wrapInTemplate(body, title) {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      color: white;
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
