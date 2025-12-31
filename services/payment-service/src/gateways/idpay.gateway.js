const axios = require('axios');
const BaseGateway = require('./base.gateway');
const config = require('../config');
const logger = require('../utils/logger');

class IDPayGateway extends BaseGateway {
  constructor() {
    super('idpay');
    this.apiKey = config.gateways.idpay.apiKey;
    this.sandbox = config.gateways.idpay.sandbox;
    this.callbackUrl = config.gateways.idpay.callbackUrl;
    
    this.baseUrl = 'https://api.idpay.ir/v1.1';
  }

  async createPayment(payment) {
    try {
      // In sandbox/development mode, return mock response
      if (this.sandbox || config.env === 'development') {
        const mockId = `IDPAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
          success: true,
          authority: mockId,
          paymentUrl: `https://idpay.ir/p/sandbox/${mockId}`,
          gatewayResponse: {
            id: mockId,
            link: `https://idpay.ir/p/sandbox/${mockId}`
          }
        };
      }

      const response = await axios.post(`${this.baseUrl}/payment`, {
        order_id: payment.orderId || payment.id,
        amount: Math.round(payment.amount),
        callback: `${this.callbackUrl}?paymentId=${payment.id}`,
        desc: payment.description || 'پرداخت سفارش کترینگ'
      }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'X-SANDBOX': this.sandbox ? '1' : '0'
        }
      });

      return {
        success: true,
        authority: response.data.id,
        paymentUrl: response.data.link,
        gatewayResponse: response.data
      };
    } catch (error) {
      logger.error('خطا در ایجاد پرداخت آیدی‌پی', { error: error.message });
      return {
        success: false,
        error: this.getErrorMessage(error.response?.data?.error_code),
        gatewayResponse: error.response?.data || { error: error.message }
      };
    }
  }

  async verifyPayment(id, orderId) {
    try {
      // In sandbox/development mode, return mock success
      if (this.sandbox || config.env === 'development') {
        if (id.startsWith('IDPAY-')) {
          return {
            success: true,
            refId: `TRACK-${Date.now()}`,
            cardPan: '6037-****-****-5678',
            gatewayResponse: {
              status: 100,
              track_id: `TRACK-${Date.now()}`,
              payment: { card_no: '6037-****-****-5678' }
            }
          };
        }
      }

      const response = await axios.post(`${this.baseUrl}/payment/verify`, {
        id,
        order_id: orderId
      }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'X-SANDBOX': this.sandbox ? '1' : '0'
        }
      });

      if (response.data.status === 100 || response.data.status === 101) {
        return {
          success: true,
          refId: response.data.track_id,
          cardPan: response.data.payment?.card_no,
          gatewayResponse: response.data
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(response.data.status),
        gatewayResponse: response.data
      };
    } catch (error) {
      logger.error('خطا در تایید پرداخت آیدی‌پی', { error: error.message });
      return {
        success: false,
        error: this.getErrorMessage(error.response?.data?.error_code),
        gatewayResponse: error.response?.data || { error: error.message }
      };
    }
  }

  async refundPayment(payment, amount) {
    logger.info('درخواست استرداد آیدی‌پی', { paymentId: payment.id, amount });
    
    return {
      success: true,
      refundId: `REFUND-${Date.now()}`,
      message: 'درخواست استرداد ثبت شد'
    };
  }

  getErrorMessage(code) {
    const errors = {
      1: 'پرداخت انجام نشده است',
      2: 'پرداخت ناموفق بوده است',
      3: 'خطا رخ داده است',
      4: 'بلوکه شده',
      5: 'برگشت به پرداخت کننده',
      6: 'برگشت خورده سیستمی',
      7: 'انصراف از پرداخت',
      8: 'به درگاه پرداخت منتقل شد',
      10: 'در انتظار تایید پرداخت',
      100: 'پرداخت تایید شده است',
      101: 'پرداخت قبلا تایید شده است',
      200: 'به دریافت کننده واریز شد',
      11: 'کاربر مسدود است',
      12: 'API Key یافت نشد',
      13: 'درخواست شما از IP نامعتبر ارسال شده است',
      14: 'وب سرویس شما در حال بررسی است',
      21: 'حساب بانکی متصل به وب سرویس تایید نشده است',
      31: 'کد تراکنش id نباید خالی باشد',
      32: 'شماره سفارش order_id نباید خالی باشد',
      33: 'مبلغ amount نباید خالی باشد',
      34: 'مبلغ amount باید بیشتر از ۱۰۰۰۰ ریال باشد',
      35: 'مبلغ amount باید کمتر از ۵۰۰,۰۰۰,۰۰۰ ریال باشد',
      36: 'مبلغ amount بیشتر از حد مجاز است',
      37: 'آدرس بازگشت callback نباید خالی باشد',
      38: 'دامنه آدرس بازگشت callback با آدرس ثبت شده در وب سرویس همخوانی ندارد',
      51: 'تراکنش ایجاد نشد',
      52: 'استعلام نتیجه ای نداشت',
      53: 'تایید پرداخت امکان پذیر نیست',
      54: 'مدت زمان تایید پرداخت سپری شده است'
    };
    return errors[code] || 'خطای ناشناخته در درگاه پرداخت';
  }
}

module.exports = new IDPayGateway();
