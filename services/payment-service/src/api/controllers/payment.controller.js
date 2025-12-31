const { paymentService } = require('../../services');
const logger = require('../../utils/logger');

class PaymentController {
  // Create payment request
  async createPayment(req, res, next) {
    try {
      const paymentData = {
        ...req.body,
        userId: req.user.id
      };
      
      const result = await paymentService.createPayment(paymentData);
      
      res.status(201).json({
        success: true,
        data: {
          payment: result.payment,
          paymentUrl: result.paymentUrl
        },
        message: 'درخواست پرداخت ایجاد شد. به درگاه پرداخت منتقل شوید'
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify payment (callback from gateway)
  async verifyPayment(req, res, next) {
    try {
      const { paymentId, Authority, Status, id, status, track_id } = { ...req.query, ...req.body };
      
      // Handle different gateway callback formats
      const gatewayData = {
        authority: Authority || id,
        status: Status || status,
        trackId: track_id
      };

      const payment = await paymentService.verifyPayment(paymentId, gatewayData);
      
      // For GET requests (redirect from gateway), redirect to frontend
      if (req.method === 'GET') {
        const redirectUrl = payment.status === 'completed'
          ? `/payment/success?trackingCode=${payment.trackingCode}`
          : `/payment/failed?trackingCode=${payment.trackingCode}`;
        
        return res.redirect(redirectUrl);
      }
      
      res.json({
        success: true,
        data: payment,
        message: payment.status === 'completed' ? 'پرداخت با موفقیت انجام شد' : 'پرداخت ناموفق بود'
      });
    } catch (error) {
      // For GET requests, redirect to error page
      if (req.method === 'GET') {
        return res.redirect(`/payment/failed?error=${encodeURIComponent(error.message)}`);
      }
      next(error);
    }
  }

  // Get payment by ID
  async findById(req, res, next) {
    try {
      const payment = await paymentService.findById(req.params.id);
      
      res.json({
        success: true,
        data: payment,
        message: 'اطلاعات پرداخت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get payment by tracking code
  async findByTrackingCode(req, res, next) {
    try {
      const payment = await paymentService.findByTrackingCode(req.params.trackingCode);
      
      res.json({
        success: true,
        data: payment,
        message: 'اطلاعات پرداخت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get payment history
  async getHistory(req, res, next) {
    try {
      const result = await paymentService.getHistory(req.user.id, req.query);
      
      res.json({
        success: true,
        data: result.payments,
        message: 'تاریخچه پرداخت‌ها دریافت شد',
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Refund payment
  async refund(req, res, next) {
    try {
      const payment = await paymentService.refund(
        req.params.id,
        req.user.id,
        req.body.reason
      );
      
      res.json({
        success: true,
        data: payment,
        message: 'درخواست استرداد با موفقیت ثبت شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
