const { Payment } = require('../models');
const { getGateway } = require('../gateways');
const eventPublisher = require('../events/publisher');
const config = require('../config');
const walletClient = require('../utils/walletClient');
const { generateTrackingCode, paymentStatusLabels, gatewayLabels } = require('../utils/helpers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class PaymentService {
  async createPayment(paymentData) {
    const {
      orderId,
      invoiceId,
      userId,
      amount,
      gateway = config.gateways.default,
      method = 'online',
      balanceType = 'personal',
      description,
      metadata = {}
    } = paymentData;

    // Validate amount
    if (amount < 1000) {
      throw {
        statusCode: 400,
        code: 'ERR_INVALID_AMOUNT',
        message: 'حداقل مبلغ پرداخت ۱۰۰۰ تومان است'
      };
    }

    // Create payment record
    const trackingCode = generateTrackingCode();
    const payment = await Payment.create({
      orderId,
      invoiceId,
      userId,
      amount,
      method,
      gateway: method === 'wallet' ? 'wallet' : gateway,
      trackingCode,
      description: description || 'پرداخت سفارش کترینگ',
      status: 'pending',
      metadata: { ...metadata, balanceType }
    });

    // Handle wallet payment
    if (method === 'wallet') {
      return this.processWalletPayment(payment, balanceType);
    }

    // Get gateway and create payment
    const gatewayInstance = getGateway(gateway);
    const result = await gatewayInstance.createPayment(payment);

    if (!result.success) {
      await payment.update({
        status: 'failed',
        gatewayResponse: result.gatewayResponse
      });

      throw {
        statusCode: 400,
        code: 'ERR_GATEWAY_ERROR',
        message: result.error || 'خطا در اتصال به درگاه پرداخت'
      };
    }

    // Update payment with gateway info
    await payment.update({
      status: 'processing',
      gatewayRef: result.authority,
      gatewayResponse: result.gatewayResponse
    });

    // Publish event
    await eventPublisher.publish('payment.initiated', {
      paymentId: payment.id,
      orderId: payment.orderId,
      invoiceId: payment.invoiceId,
      userId: payment.userId,
      amount: payment.amount,
      gateway: payment.gateway,
      trackingCode: payment.trackingCode
    });

    logger.info('پرداخت ایجاد شد', { paymentId: payment.id, trackingCode });

    return {
      payment: this.formatPayment(payment),
      paymentUrl: result.paymentUrl
    };
  }

  /**
   * Process wallet payment - deduct directly from wallet
   */
  async processWalletPayment(payment, balanceType = 'personal') {
    try {
      // Check balance first
      const balanceCheck = await walletClient.checkBalance(
        payment.userId,
        parseFloat(payment.amount),
        balanceType
      );

      if (!balanceCheck.sufficient) {
        await payment.update({
          status: 'failed',
          gatewayResponse: { error: 'insufficient_balance', ...balanceCheck }
        });

        throw {
          statusCode: 400,
          code: 'ERR_INSUFFICIENT_BALANCE',
          message: `موجودی کیف پول کافی نیست. موجودی فعلی: ${balanceCheck.currentBalance.toLocaleString('fa-IR')} تومان، مبلغ مورد نیاز: ${parseFloat(payment.amount).toLocaleString('fa-IR')} تومان`
        };
      }

      // Deduct from wallet
      const deductResult = await walletClient.deduct(
        payment.userId,
        parseFloat(payment.amount),
        balanceType,
        'payment',
        payment.id,
        payment.description || 'پرداخت سفارش'
      );

      // Update payment as completed
      await payment.update({
        status: 'completed',
        paidAt: new Date(),
        gatewayRef: `WALLET-${deductResult.transaction?.id || Date.now()}`,
        gatewayResponse: {
          method: 'wallet',
          balanceType,
          transaction: deductResult.transaction,
          newBalance: deductResult.wallet?.personalBalance || deductResult.wallet?.companyBalance
        }
      });

      // Publish success event
      await eventPublisher.publish('payment.completed', {
        paymentId: payment.id,
        orderId: payment.orderId,
        invoiceId: payment.invoiceId,
        userId: payment.userId,
        amount: parseFloat(payment.amount),
        gateway: 'wallet',
        trackingCode: payment.trackingCode,
        refId: payment.gatewayRef
      });

      logger.info('پرداخت با کیف پول انجام شد', {
        paymentId: payment.id,
        trackingCode: payment.trackingCode,
        amount: payment.amount
      });

      return {
        payment: this.formatPayment(payment),
        paymentUrl: null,
        walletTransaction: deductResult.transaction
      };

    } catch (error) {
      if (error.statusCode) throw error;

      await payment.update({
        status: 'failed',
        gatewayResponse: { error: error.message }
      });

      logger.error('خطا در پرداخت با کیف پول', {
        paymentId: payment.id,
        error: error.message
      });

      throw {
        statusCode: error.statusCode || 500,
        code: error.code || 'ERR_WALLET_PAYMENT_FAILED',
        message: error.message || 'خطا در پرداخت با کیف پول'
      };
    }
  }

  async verifyPayment(paymentId, gatewayData) {
    const payment = await Payment.findByPk(paymentId);
    
    if (!payment) {
      throw {
        statusCode: 404,
        code: 'ERR_PAYMENT_NOT_FOUND',
        message: 'پرداخت یافت نشد'
      };
    }

    if (payment.status === 'completed') {
      return this.formatPayment(payment);
    }

    if (payment.status !== 'processing') {
      throw {
        statusCode: 400,
        code: 'ERR_INVALID_PAYMENT_STATUS',
        message: 'وضعیت پرداخت نامعتبر است'
      };
    }

    // Verify with gateway
    const gatewayInstance = getGateway(payment.gateway);
    const result = await gatewayInstance.verifyPayment(
      payment.gatewayRef,
      payment.amount
    );

    if (result.success) {
      await payment.update({
        status: 'completed',
        paidAt: new Date(),
        gatewayResponse: {
          ...payment.gatewayResponse,
          verify: result.gatewayResponse
        }
      });

      // Publish success event
      await eventPublisher.publish('payment.completed', {
        paymentId: payment.id,
        orderId: payment.orderId,
        invoiceId: payment.invoiceId,
        userId: payment.userId,
        amount: parseFloat(payment.amount),
        gateway: payment.gateway,
        trackingCode: payment.trackingCode,
        refId: result.refId
      });

      logger.info('پرداخت تایید شد', { paymentId: payment.id, refId: result.refId });
    } else {
      await payment.update({
        status: 'failed',
        gatewayResponse: {
          ...payment.gatewayResponse,
          verify: result.gatewayResponse
        }
      });

      // Publish failure event
      await eventPublisher.publish('payment.failed', {
        paymentId: payment.id,
        orderId: payment.orderId,
        invoiceId: payment.invoiceId,
        userId: payment.userId,
        amount: parseFloat(payment.amount),
        error: result.error
      });

      logger.warn('پرداخت ناموفق', { paymentId: payment.id, error: result.error });

      throw {
        statusCode: 400,
        code: 'ERR_PAYMENT_FAILED',
        message: result.error || 'پرداخت ناموفق بود'
      };
    }

    return this.formatPayment(payment);
  }

  async findById(id) {
    const payment = await Payment.findByPk(id);
    
    if (!payment) {
      throw {
        statusCode: 404,
        code: 'ERR_PAYMENT_NOT_FOUND',
        message: 'پرداخت یافت نشد'
      };
    }

    return this.formatPayment(payment);
  }

  async findByTrackingCode(trackingCode) {
    const payment = await Payment.findOne({ where: { trackingCode } });
    
    if (!payment) {
      throw {
        statusCode: 404,
        code: 'ERR_PAYMENT_NOT_FOUND',
        message: 'پرداخت یافت نشد'
      };
    }

    return this.formatPayment(payment);
  }

  async getHistory(userId, options = {}) {
    const { page = 1, limit = 20, status, fromDate, toDate } = options;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      payments: rows.map(p => this.formatPayment(p)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async refund(id, userId, reason) {
    const payment = await Payment.findByPk(id);
    
    if (!payment) {
      throw {
        statusCode: 404,
        code: 'ERR_PAYMENT_NOT_FOUND',
        message: 'پرداخت یافت نشد'
      };
    }

    if (payment.status !== 'completed') {
      throw {
        statusCode: 400,
        code: 'ERR_CANNOT_REFUND',
        message: 'فقط پرداخت‌های موفق قابل استرداد هستند'
      };
    }

    if (payment.status === 'refunded') {
      throw {
        statusCode: 400,
        code: 'ERR_ALREADY_REFUNDED',
        message: 'این پرداخت قبلاً مسترد شده است'
      };
    }

    // Process refund with gateway
    const gatewayInstance = getGateway(payment.gateway);
    const result = await gatewayInstance.refundPayment(payment, payment.amount);

    await payment.update({
      status: 'refunded',
      refundedAt: new Date(),
      refundAmount: payment.amount,
      refundReason: reason
    });

    // Publish refund event
    await eventPublisher.publish('payment.refunded', {
      paymentId: payment.id,
      orderId: payment.orderId,
      invoiceId: payment.invoiceId,
      userId: payment.userId,
      amount: parseFloat(payment.amount),
      reason
    });

    logger.info('پرداخت مسترد شد', { paymentId: payment.id });

    return this.formatPayment(payment);
  }

  formatPayment(payment) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      invoiceId: payment.invoiceId,
      userId: payment.userId,
      amount: parseFloat(payment.amount),
      status: payment.status,
      statusLabel: paymentStatusLabels[payment.status],
      method: payment.method,
      gateway: payment.gateway,
      gatewayLabel: gatewayLabels[payment.gateway],
      trackingCode: payment.trackingCode,
      description: payment.description,
      paidAt: payment.paidAt,
      refundedAt: payment.refundedAt,
      refundAmount: payment.refundAmount ? parseFloat(payment.refundAmount) : null,
      refundReason: payment.refundReason,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    };
  }
}

module.exports = new PaymentService();
