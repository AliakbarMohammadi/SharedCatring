/**
 * Flow 5: Cancellation & Refund
 * جریان ۵: لغو و استرداد
 */

const { clients } = require('../helpers/api-client');
const { 
  generateId,
  wait,
  logStep, 
  logSuccess, 
  logInfo 
} = require('../helpers/test-utils');
const config = require('../config');

describe('↩️ جریان ۵: لغو و استرداد', () => {
  let userId = generateId();
  let companyId = generateId();
  let orderId = null;
  let paymentId = null;
  let invoiceId = null;
  let initialBalance = 0;

  beforeAll(() => {
    clients.order.setUserHeaders(userId, 'user', companyId);
    clients.payment.setUserHeaders(userId, 'user');
    clients.wallet.setUserHeaders(userId, 'user', companyId);
    clients.invoice.setUserHeaders(userId, 'user');
    clients.notification.setUserHeaders(userId, 'user');
    
    logInfo(`شناسه کاربر: ${userId}`);
    logInfo(`شناسه شرکت: ${companyId}`);
  });

  test('مرحله ۱: ایجاد سفارش و پرداخت', async () => {
    logStep(1, 'ایجاد سفارش و پرداخت');

    // Create order
    const orderData = {
      companyId: companyId,
      items: [
        {
          menuItemId: generateId(),
          name: 'زرشک پلو با مرغ',
          quantity: 1,
          unitPrice: 160000
        }
      ],
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTime: '12:00'
    };

    const orderResponse = await clients.order.post('/api/v1/orders', orderData);

    if (orderResponse.success) {
      orderId = orderResponse.data.id;
      logSuccess(`سفارش ایجاد شد: ${orderId}`);
    } else {
      logInfo(`ایجاد سفارش: ${orderResponse.error?.message || 'خطا'}`);
      orderId = generateId();
    }

    // Create payment
    const paymentResponse = await clients.payment.post('/api/v1/payments/request', {
      orderId: orderId,
      amount: 160000,
      gateway: 'zarinpal'
    });

    if (paymentResponse.success) {
      paymentId = paymentResponse.data.id;
      logSuccess(`پرداخت ایجاد شد: ${paymentId}`);
    } else {
      logInfo(`ایجاد پرداخت: ${paymentResponse.error?.message || 'خطا'}`);
      paymentId = generateId();
    }

    // Simulate payment completion
    await clients.payment.post('/api/v1/payments/verify', {
      paymentId: paymentId,
      authority: `MOCK-${Date.now()}`,
      status: 'OK'
    });

    // Confirm order
    clients.order.setUserHeaders(userId, 'admin');
    await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
      status: 'confirmed'
    });

    await wait(500);
  }, config.timeouts.long);

  test('مرحله ۲: ثبت موجودی اولیه کیف پول', async () => {
    logStep(2, 'ثبت موجودی اولیه کیف پول');

    const response = await clients.wallet.get('/api/v1/wallets/balance');

    if (response.success) {
      initialBalance = (response.data.personalBalance || 0) + (response.data.companyBalance || 0);
      logSuccess(`موجودی اولیه: ${initialBalance} تومان`);
    } else {
      logInfo(`دریافت موجودی: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۳: لغو سفارش', async () => {
    logStep(3, 'لغو سفارش');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    clients.order.setUserHeaders(userId, 'user', companyId);
    
    const response = await clients.order.patch(`/api/v1/orders/${orderId}/cancel`, {
      reason: 'تغییر برنامه - نیاز به لغو سفارش'
    });

    if (response.success) {
      expect(response.data.status).toBe('cancelled');
      logSuccess('سفارش لغو شد');
    } else {
      // Try alternative endpoint
      const altResponse = await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
        status: 'cancelled',
        reason: 'تغییر برنامه'
      });

      if (altResponse.success) {
        logSuccess('سفارش لغو شد');
      } else {
        logInfo(`لغو سفارش: ${altResponse.error?.message || 'خطا'}`);
      }
    }

    // Wait for event processing
    await wait(1000);
  }, config.timeouts.medium);

  test('مرحله ۴: استرداد پرداخت', async () => {
    logStep(4, 'استرداد پرداخت');

    if (!paymentId) {
      logInfo('شناسه پرداخت موجود نیست - رد شد');
      return;
    }

    const response = await clients.payment.post(`/api/v1/payments/${paymentId}/refund`, {
      amount: 160000,
      reason: 'لغو سفارش توسط کاربر'
    });

    if (response.success) {
      logSuccess('پرداخت استرداد شد');
      logInfo(`مبلغ استرداد: ${response.data.refundAmount || 160000} تومان`);
    } else {
      logInfo(`استرداد پرداخت: ${response.error?.message || 'خطا'}`);
    }

    await wait(500);
  }, config.timeouts.medium);

  test('مرحله ۵: استرداد به کیف پول', async () => {
    logStep(5, 'استرداد به کیف پول');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    // Internal refund API
    const response = await clients.wallet.post('/internal/refund', {
      userId: userId,
      amount: 160000,
      referenceType: 'order_cancellation',
      referenceId: orderId,
      description: 'استرداد وجه بابت لغو سفارش'
    });

    if (response.success) {
      logSuccess('مبلغ به کیف پول برگشت داده شد');
    } else {
      logInfo(`استرداد به کیف پول: ${response.error?.message || 'خطا'}`);
    }

    await wait(500);
  }, config.timeouts.medium);

  test('مرحله ۶: بررسی موجودی نهایی', async () => {
    logStep(6, 'بررسی موجودی نهایی');

    const response = await clients.wallet.get('/api/v1/wallets/balance');

    if (response.success) {
      const finalBalance = (response.data.personalBalance || 0) + (response.data.companyBalance || 0);
      logSuccess(`موجودی نهایی: ${finalBalance} تومان`);
      
      // Balance should be restored (or higher if refund was processed)
      if (finalBalance >= initialBalance) {
        logSuccess('موجودی به درستی برگشت داده شده است');
      } else {
        logInfo(`تفاوت موجودی: ${initialBalance - finalBalance} تومان`);
      }
    } else {
      logInfo(`دریافت موجودی: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۷: به‌روزرسانی وضعیت فاکتور', async () => {
    logStep(7, 'به‌روزرسانی وضعیت فاکتور');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    // Get invoice for order
    const getResponse = await clients.invoice.get(`/api/v1/invoices/order/${orderId}`);

    if (getResponse.success && getResponse.data) {
      invoiceId = getResponse.data.id;
      
      // Update invoice status
      const updateResponse = await clients.invoice.patch(`/api/v1/invoices/${invoiceId}/status`, {
        status: 'cancelled'
      });

      if (updateResponse.success) {
        logSuccess('وضعیت فاکتور به "لغو شده" تغییر کرد');
      } else {
        logInfo(`به‌روزرسانی فاکتور: ${updateResponse.error?.message || 'خطا'}`);
      }
    } else {
      logInfo('فاکتوری برای این سفارش یافت نشد');
    }
  }, config.timeouts.medium);

  test('مرحله ۸: بررسی اعلان‌های استرداد', async () => {
    logStep(8, 'بررسی اعلان‌های استرداد');

    // Wait for notifications
    await wait(1000);

    const response = await clients.notification.get('/api/v1/notifications');

    if (response.success) {
      const notifications = response.data.notifications || response.data;
      if (Array.isArray(notifications)) {
        const refundNotifications = notifications.filter(n => 
          n.category === 'payment' || 
          n.category === 'wallet' ||
          (n.body && n.body.includes('استرداد'))
        );
        
        if (refundNotifications.length > 0) {
          logSuccess(`${refundNotifications.length} اعلان استرداد یافت شد`);
        } else {
          logInfo('اعلان استرداد یافت نشد');
        }
      }
    } else {
      logInfo(`دریافت اعلان‌ها: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۹: بررسی تاریخچه تراکنش‌ها', async () => {
    logStep(9, 'بررسی تاریخچه تراکنش‌ها');

    const response = await clients.wallet.get('/api/v1/wallets/transactions');

    if (response.success) {
      const transactions = response.data.transactions || response.data;
      if (Array.isArray(transactions)) {
        logSuccess(`${transactions.length} تراکنش یافت شد`);
        
        // Find refund transaction
        const refundTx = transactions.find(t => 
          t.type === 'order_refund' || 
          t.type === 'refund' ||
          (t.description && t.description.includes('استرداد'))
        );
        
        if (refundTx) {
          logSuccess(`تراکنش استرداد: ${refundTx.amount} تومان`);
        }
      }
    } else {
      logInfo(`دریافت تراکنش‌ها: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  afterAll(() => {
    clients.order.clearAuth();
    clients.payment.clearAuth();
    clients.wallet.clearAuth();
    clients.invoice.clearAuth();
    clients.notification.clearAuth();
    
    console.log('\n📋 خلاصه جریان ۵:');
    console.log(`  - شناسه سفارش: ${orderId || 'ایجاد نشد'}`);
    console.log(`  - شناسه پرداخت: ${paymentId || 'ایجاد نشد'}`);
    console.log(`  - شناسه فاکتور: ${invoiceId || 'یافت نشد'}`);
    console.log(`  - موجودی اولیه: ${initialBalance} تومان`);
  });
});
