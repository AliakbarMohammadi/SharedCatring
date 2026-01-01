const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * SMS Service - Production Ready
 * سرویس پیامک - آماده تولید
 * 
 * پشتیبانی از ارائه‌دهندگان واقعی پیامک ایرانی
 */
class SMSService {
  constructor() {
    this.provider = config.sms.provider;
    this.apiKey = config.sms.apiKey;
    this.sender = config.sms.sender;
    
    // Validate configuration on startup
    this.validateConfig();
  }

  /**
   * Validate SMS configuration
   */
  validateConfig() {
    if (!this.apiKey && this.provider !== 'console') {
      logger.warn('⚠️ کلید API پیامک تنظیم نشده است. پیامک‌ها در کنسول نمایش داده می‌شوند');
    }
  }

  /**
   * Send SMS message
   * @param {string} phone - Phone number
   * @param {string} message - Message content
   * @returns {Promise<Object>}
   */
  async send(phone, message) {
    try {
      // Normalize phone number
      const normalizedPhone = this.normalizePhone(phone);
      
      // Log the SMS attempt
      logger.info('ارسال پیامک', { 
        phone: normalizedPhone, 
        provider: this.provider,
        messageLength: message.length
      });

      let result;

      switch (this.provider) {
        case 'kavenegar':
          result = await this.sendKavenegar(normalizedPhone, message);
          break;
        
        case 'melipayamak':
          result = await this.sendMelipayamak(normalizedPhone, message);
          break;
        
        case 'ghasedak':
          result = await this.sendGhasedak(normalizedPhone, message);
          break;
        
        case 'console':
          // Console mode for development - logs but doesn't send
          result = await this.sendConsole(normalizedPhone, message);
          break;
        
        default:
          // Default to console logging if no valid provider
          logger.warn('ارائه‌دهنده پیامک نامعتبر، استفاده از حالت کنسول', { provider: this.provider });
          result = await this.sendConsole(normalizedPhone, message);
      }

      logger.info('پیامک ارسال شد', { 
        phone: normalizedPhone, 
        messageId: result.messageId,
        provider: this.provider
      });

      return result;
    } catch (error) {
      logger.error('خطا در ارسال پیامک', { 
        error: error.message, 
        phone,
        provider: this.provider 
      });
      
      // Return failure but don't throw - notification failures shouldn't break the flow
      return { 
        success: false, 
        error: error.message,
        provider: this.provider
      };
    }
  }

  /**
   * Normalize Iranian phone number to international format
   * @param {string} phone 
   * @returns {string}
   */
  normalizePhone(phone) {
    // Remove spaces, dashes, and parentheses
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    
    // Convert to international format (98...)
    if (normalized.startsWith('0')) {
      normalized = '98' + normalized.substring(1);
    } else if (normalized.startsWith('+98')) {
      normalized = normalized.substring(1);
    } else if (normalized.startsWith('+')) {
      normalized = normalized.substring(1);
    } else if (!normalized.startsWith('98')) {
      normalized = '98' + normalized;
    }
    
    return normalized;
  }

  /**
   * Console logging mode (for development/testing)
   * @param {string} phone 
   * @param {string} message 
   * @returns {Promise<Object>}
   */
  async sendConsole(phone, message) {
    const messageId = `console-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('📱 پیامک (کنسول)', { 
      phone, 
      message,
      messageId
    });
    
    return { 
      success: true, 
      messageId,
      provider: 'console',
      note: 'پیامک در کنسول ثبت شد'
    };
  }

  /**
   * Kavenegar SMS Provider
   * https://kavenegar.com
   * @param {string} phone 
   * @param {string} message 
   * @returns {Promise<Object>}
   */
  async sendKavenegar(phone, message) {
    if (!this.apiKey) {
      throw new Error('کلید API کاوه‌نگار تنظیم نشده است');
    }

    const url = `https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json`;
    
    const response = await axios.post(url, null, {
      params: {
        receptor: phone,
        message,
        sender: this.sender
      },
      timeout: 10000
    });

    if (response.data.return?.status !== 200) {
      throw new Error(response.data.return?.message || 'خطا در ارسال پیامک از کاوه‌نگار');
    }

    return {
      success: true,
      messageId: response.data.entries?.[0]?.messageid || `kav-${Date.now()}`,
      provider: 'kavenegar',
      status: response.data.entries?.[0]?.status
    };
  }

  /**
   * Melipayamak SMS Provider
   * https://melipayamak.com
   * @param {string} phone 
   * @param {string} message 
   * @returns {Promise<Object>}
   */
  async sendMelipayamak(phone, message) {
    if (!this.apiKey) {
      throw new Error('کلید API ملی‌پیامک تنظیم نشده است');
    }

    const url = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';
    
    const response = await axios.post(url, {
      username: this.apiKey,
      password: config.sms.password || '',
      to: phone,
      from: this.sender,
      text: message,
      isFlash: false
    }, {
      timeout: 10000
    });

    if (response.data.RetStatus !== 1) {
      throw new Error(`خطا در ارسال پیامک از ملی‌پیامک: ${response.data.StrRetStatus}`);
    }

    return {
      success: true,
      messageId: response.data.Value || `meli-${Date.now()}`,
      provider: 'melipayamak'
    };
  }

  /**
   * Ghasedak SMS Provider
   * https://ghasedak.me
   * @param {string} phone 
   * @param {string} message 
   * @returns {Promise<Object>}
   */
  async sendGhasedak(phone, message) {
    if (!this.apiKey) {
      throw new Error('کلید API قاصدک تنظیم نشده است');
    }

    const url = 'https://api.ghasedak.me/v2/sms/send/simple';
    
    const response = await axios.post(url, {
      receptor: phone,
      message,
      linenumber: this.sender
    }, {
      headers: {
        'apikey': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });

    if (response.data.result?.code !== 200) {
      throw new Error(response.data.result?.message || 'خطا در ارسال پیامک از قاصدک');
    }

    return {
      success: true,
      messageId: response.data.items?.[0]?.messageid || `ghasedak-${Date.now()}`,
      provider: 'ghasedak'
    };
  }

  /**
   * Send OTP verification code
   * @param {string} phone 
   * @param {string} code 
   * @returns {Promise<Object>}
   */
  async sendOTP(phone, code) {
    const message = `کد تأیید شما: ${code}\nسیستم کترینگ`;
    return this.send(phone, message);
  }

  /**
   * Send order notification
   * @param {string} phone 
   * @param {Object} orderInfo 
   * @returns {Promise<Object>}
   */
  async sendOrderNotification(phone, orderInfo) {
    const message = `سفارش شما با شماره ${orderInfo.orderNumber} ${orderInfo.status} شد.\nسیستم کترینگ`;
    return this.send(phone, message);
  }
}

module.exports = new SMSService();
