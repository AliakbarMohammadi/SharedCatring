const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.provider = config.sms.provider;
    this.apiKey = config.sms.apiKey;
    this.sender = config.sms.sender;
  }

  async send(phone, message) {
    try {
      // Normalize phone number
      const normalizedPhone = this.normalizePhone(phone);
      
      // In development or mock mode, just log
      if (config.env === 'development' || this.provider === 'mock') {
        logger.info('📱 پیامک (شبیه‌سازی)', { 
          phone: normalizedPhone, 
          message: message.substring(0, 50) + '...'
        });
        return { 
          success: true, 
          messageId: `sms-${Date.now()}`,
          simulated: true 
        };
      }

      // Real SMS provider integration would go here
      // Example for Kavenegar:
      // const result = await this.sendKavenegar(normalizedPhone, message);
      
      return { 
        success: true, 
        messageId: `sms-${Date.now()}` 
      };
    } catch (error) {
      logger.error('خطا در ارسال پیامک', { error: error.message, phone });
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  normalizePhone(phone) {
    // Remove spaces and dashes
    let normalized = phone.replace(/[\s-]/g, '');
    
    // Convert to international format
    if (normalized.startsWith('0')) {
      normalized = '98' + normalized.substring(1);
    } else if (normalized.startsWith('+98')) {
      normalized = normalized.substring(1);
    } else if (!normalized.startsWith('98')) {
      normalized = '98' + normalized;
    }
    
    return normalized;
  }

  // Example Kavenegar integration (commented out)
  async sendKavenegar(phone, message) {
    const url = `https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json`;
    const response = await axios.post(url, null, {
      params: {
        receptor: phone,
        message,
        sender: this.sender
      }
    });
    return response.data;
  }

  // Example Melipayamak integration (commented out)
  async sendMelipayamak(phone, message) {
    const url = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';
    const response = await axios.post(url, {
      username: this.apiKey,
      password: config.sms.password,
      to: phone,
      from: this.sender,
      text: message
    });
    return response.data;
  }
}

module.exports = new SMSService();
