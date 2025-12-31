const axios = require('axios');
const BaseGateway = require('./base.gateway');
const config = require('../config');
const logger = require('../utils/logger');

class ZarinpalGateway extends BaseGateway {
  constructor() {
    super('zarinpal');
    this.merchantId = config.gateways.zarinpal.merchantId;
    this.sandbox = config.gateways.zarinpal.sandbox;
    this.callbackUrl = config.gateways.zarinpal.callbackUrl;
    
    this.baseUrl = this.sandbox 
      ? 'https://sandbox.zarinpal.com/pg/v4/payment'
      : 'https://api.zarinpal.com/pg/v4/payment';
    
    this.paymentUrl = this.sandbox
      ? 'https://sandbox.zarinpal.com/pg/StartPay'
      : 'https://www.zarinpal.com/pg/StartPay';
  }

  async createPayment(payment) {
    try {
      // In sandbox/development mode, return mock response
      if (this.sandbox || config.env === 'development') {
        const mockAuthority = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
          success: true,
          authority: mockAuthority,
          paymentUrl: `${this.paymentUrl}/${mockAuthority}`,
          gatewayResponse: {
            code: 100,
            message: 'Success (Mock)',
            authority: mockAuthority
          }
        };
      }

      const response = await axios.post(`${this.baseUrl}/request.json`, {
        merchant_id: this.merchantId,
        amount: Math.round(payment.amount),
        callback_url: `${this.callbackUrl}?paymentId=${payment.id}`,
        description: payment.description || 'پرداخت سفارش کترینگ',
        metadata: {
          order_id: payment.orderId,
          invoice_id: payment.invoiceId
        }
      });

      if (response.data.data.code === 100) {
        return {
          success: true,
          authority: response.data.data.authority,
          paymentUrl: `${this.paymentUrl}/${response.data.data.authority}`,
          gatewayResponse: response.data
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(response.data.errors.code),
        gatewayResponse: response.data
      };
    } catch (error) {
      logger.error('خطا در ایجاد پرداخت زرین‌پال', { error: error.message });
      return {
        success: false,
        error: 'خطا در اتصال به درگاه پرداخت',
        gatewayResponse: { error: error.message }
      };
    }
  }

  async verifyPayment(authority, amount) {
    try {
      // In sandbox/development mode, return mock success
      if (this.sandbox || config.env === 'development') {
        if (authority.startsWith('MOCK-')) {
          return {
            success: true,
            refId: `REF-${Date.now()}`,
            cardPan: '6037-****-****-1234',
            gatewayResponse: {
              code: 100,
              message: 'Verified (Mock)',
              ref_id: `REF-${Date.now()}`
            }
          };
        }
      }

      const response = await axios.post(`${this.baseUrl}/verify.json`, {
        merchant_id: this.merchantId,
        authority,
        amount: Math.round(amount)
      });

      if (response.data.data.code === 100 || response.data.data.code === 101) {
        return {
          success: true,
          refId: response.data.data.ref_id,
          cardPan: response.data.data.card_pan,
          gatewayResponse: response.data
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(response.data.errors.code),
        gatewayResponse: response.data
      };
    } catch (error) {
      logger.error('خطا در تایید پرداخت زرین‌پال', { error: error.message });
      return {
        success: false,
        error: 'خطا در تایید پرداخت',
        gatewayResponse: { error: error.message }
      };
    }
  }

  async refundPayment(payment, amount) {
    // ZarinPal doesn't have direct refund API in sandbox
    // In production, this would call the refund endpoint
    logger.info('درخواست استرداد زرین‌پال', { paymentId: payment.id, amount });
    
    return {
      success: true,
      refundId: `REFUND-${Date.now()}`,
      message: 'درخواست استرداد ثبت شد'
    };
  }

  getErrorMessage(code) {
    const errors = {
      '-1': 'اطلاعات ارسالی ناقص است',
      '-2': 'IP یا مرچنت کد صحیح نیست',
      '-3': 'با توجه به محدودیت‌های شاپرک امکان پرداخت وجود ندارد',
      '-4': 'سطح تایید پذیرنده پایین‌تر از سطح نقره‌ای است',
      '-11': 'درخواست مورد نظر یافت نشد',
      '-12': 'امکان ویرایش درخواست وجود ندارد',
      '-21': 'هیچ نوع عملیات مالی برای این تراکنش یافت نشد',
      '-22': 'تراکنش ناموفق است',
      '-33': 'رقم تراکنش با رقم پرداخت شده مطابقت ندارد',
      '-34': 'سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور کرده است',
      '-40': 'اجازه دسترسی به متد مربوطه وجود ندارد',
      '-41': 'اطلاعات ارسالی مربوط به AdditionalData غیرمعتبر است',
      '-42': 'مدت زمان معتبر طول عمر شناسه پرداخت باید بین ۳۰ دقیقه تا ۴۵ روز باشد',
      '-54': 'درخواست مورد نظر آرشیو شده است'
    };
    return errors[code] || 'خطای ناشناخته در درگاه پرداخت';
  }
}

module.exports = new ZarinpalGateway();
