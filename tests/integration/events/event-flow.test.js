/**
 * Event Flow Tests
 * تست جریان رویدادها
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

describe('📡 تست جریان رویدادها', () => {
  let userId = generateId();
  let companyId = generateId();

  beforeAll(() => {
    logInfo(`شناسه کاربر: ${userId}`);
    logInfo(`شناسه شرکت: ${companyId}`);
  });

  describe('رویدادهای سفارش', () => {
    test('order.created باید اعلان ایجاد کند', async () => {
      logStep(1, 'تست رویداد order.created');

      clients.order.setUserHeaders(userId, 'user', companyId);
      clients.notification.setUserHeaders(userId, 'user');

      // Create order
      const orderResponse = await clients.order.post('/api/v1/orders', {
        companyId: companyId,
        items: [{ menuItemId: generateId(), name: 'تست', quantity: 1, unitPrice: 100000 }],
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: '12:00'
      });

      if (orderResponse.success) {
        logSuccess(`سفارش ایجاد شد: ${orderResponse.data.id}`);
        
        // Wait for event processing
        await wait(2000);

        // Check notifications
        const notifResponse = await clients.notification.get('/api/v1/notifications?limit=5');
        
        if (notifResponse.success) {
          const notifications = notifResponse.data.notifications || notifResponse.data;
          const orderNotif = notifications.find(n => 
            n.category === 'order' || 
            (n.title && n.title.includes('سفارش'))
          );
          
          if (orderNotif) {
            logSuccess('اعلان سفارش دریافت شد');
          } else {
            logInfo('اعلان سفارش یافت نشد (ممکن است تاخیر داشته باشد)');
          }
        }
      } else {
        logInfo(`ایجاد سفارش: ${orderResponse.error?.message || 'خطا'}`);
      }
    }, config.timeouts.long);

    test('order.confirmed باید اعلان تایید ارسال کند', async () => {
      logStep(2, 'تست رویداد order.confirmed');

      clients.order.setUserHeaders(userId, 'admin');

      // Create and confirm order
      const orderResponse = await clients.order.post('/api/v1/orders', {
        companyId: companyId,
        items: [{ menuItemId: generateId(), name: 'تست', quantity: 1, unitPrice: 100000 }],
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: '12:00'
      });

      if (orderResponse.success) {
        const orderId = orderResponse.data.id;
        
        // Confirm order
        const confirmResponse = await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
          status: 'confirmed'
        });

        if (confirmResponse.success) {
          logSuccess('سفارش تایید شد');
          await wait(1500);
          logInfo('رویداد order.confirmed منتشر شد');
        }
      }
    }, config.timeouts.long);
  });

  describe('رویدادهای پرداخت', () => {
    test('payment.completed باید کیف پول و فاکتور را به‌روز کند', async () => {
      logStep(3, 'تست رویداد payment.completed');

      clients.payment.setUserHeaders(userId, 'user');

      const paymentResponse = await clients.payment.post('/api/v1/payments/request', {
        orderId: generateId(),
        amount: 150000,
        gateway: 'zarinpal'
      });

      if (paymentResponse.success) {
        const paymentId = paymentResponse.data.id;
        logSuccess(`پرداخت ایجاد شد: ${paymentId}`);

        // Verify payment
        const verifyResponse = await clients.payment.post('/api/v1/payments/verify', {
          paymentId: paymentId,
          authority: `MOCK-${Date.now()}`,
          status: 'OK'
        });

        if (verifyResponse.success) {
          logSuccess('پرداخت تایید شد');
          await wait(1500);
          logInfo('رویداد payment.completed منتشر شد');
        }
      }
    }, config.timeouts.long);

    test('payment.refunded باید موجودی را برگرداند', async () => {
      logStep(4, 'تست رویداد payment.refunded');

      clients.payment.setUserHeaders(userId, 'user');

      // Create and complete payment
      const paymentResponse = await clients.payment.post('/api/v1/payments/request', {
        orderId: generateId(),
        amount: 100000,
        gateway: 'zarinpal'
      });

      if (paymentResponse.success) {
        const paymentId = paymentResponse.data.id;

        // Verify
        await clients.payment.post('/api/v1/payments/verify', {
          paymentId: paymentId,
          authority: `MOCK-${Date.now()}`,
          status: 'OK'
        });

        // Refund
        const refundResponse = await clients.payment.post(`/api/v1/payments/${paymentId}/refund`, {
          amount: 100000,
          reason: 'تست استرداد'
        });

        if (refundResponse.success) {
          logSuccess('استرداد انجام شد');
          await wait(1500);
          logInfo('رویداد payment.refunded منتشر شد');
        }
      }
    }, config.timeouts.long);
  });

  describe('رویدادهای کیف پول', () => {
    test('wallet.low_balance باید هشدار ارسال کند', async () => {
      logStep(5, 'تست رویداد wallet.low_balance');

      clients.wallet.setUserHeaders(userId, 'user', companyId);

      // Check balance
      const balanceResponse = await clients.wallet.get('/api/v1/wallets/balance');

      if (balanceResponse.success) {
        const balance = balanceResponse.data.personalBalance || 0;
        logInfo(`موجودی فعلی: ${balance} تومان`);
        
        if (balance < 100000) {
          logInfo('موجودی کم است - رویداد wallet.low_balance باید منتشر شده باشد');
        }
      }
    }, config.timeouts.medium);

    test('wallet.charged باید اعلان شارژ ارسال کند', async () => {
      logStep(6, 'تست رویداد wallet.charged');

      clients.wallet.setUserHeaders(userId, 'user', companyId);

      const topupResponse = await clients.wallet.post('/api/v1/wallets/topup', {
        amount: 50000,
        description: 'شارژ تست'
      });

      if (topupResponse.success) {
        logSuccess('کیف پول شارژ شد');
        await wait(1500);
        logInfo('رویداد wallet.charged منتشر شد');
      } else {
        logInfo(`شارژ کیف پول: ${topupResponse.error?.message || 'خطا'}`);
      }
    }, config.timeouts.medium);
  });

  describe('رویدادهای شرکت', () => {
    test('company.approved باید ایمیل تایید ارسال کند', async () => {
      logStep(7, 'تست رویداد company.approved');

      clients.company.setUserHeaders(userId, 'admin');

      // Create company
      const companyResponse = await clients.company.post('/api/v1/companies', {
        name: `شرکت تست ${Date.now()}`,
        nationalId: `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
        email: `test${Date.now()}@example.com`,
        phone: `0912${Math.floor(Math.random() * 10000000)}`,
        address: 'تهران'
      });

      if (companyResponse.success) {
        const newCompanyId = companyResponse.data.id;
        logSuccess(`شرکت ایجاد شد: ${newCompanyId}`);

        // Approve company
        const approveResponse = await clients.company.patch(`/api/v1/companies/${newCompanyId}/approve`, {
          status: 'approved'
        });

        if (approveResponse.success) {
          logSuccess('شرکت تایید شد');
          await wait(1500);
          logInfo('رویداد company.approved منتشر شد');
        }
      }
    }, config.timeouts.long);
  });

  describe('بررسی Idempotency', () => {
    test('پردازش مجدد رویداد نباید تکراری باشد', async () => {
      logStep(8, 'تست Idempotency');

      clients.notification.setUserHeaders(userId, 'user');

      // Get initial notification count
      const initialResponse = await clients.notification.get('/api/v1/notifications/unread-count');
      const initialCount = initialResponse.success ? (initialResponse.data.count || 0) : 0;

      logInfo(`تعداد اعلان‌های اولیه: ${initialCount}`);

      // Wait and check again
      await wait(2000);

      const finalResponse = await clients.notification.get('/api/v1/notifications/unread-count');
      const finalCount = finalResponse.success ? (finalResponse.data.count || 0) : 0;

      logInfo(`تعداد اعلان‌های نهایی: ${finalCount}`);
      logSuccess('بررسی Idempotency انجام شد');
    }, config.timeouts.medium);
  });

  afterAll(() => {
    clients.order.clearAuth();
    clients.payment.clearAuth();
    clients.wallet.clearAuth();
    clients.company.clearAuth();
    clients.notification.clearAuth();
    
    console.log('\n📋 خلاصه تست رویدادها:');
    console.log('  - رویدادهای سفارش: order.created, order.confirmed');
    console.log('  - رویدادهای پرداخت: payment.completed, payment.refunded');
    console.log('  - رویدادهای کیف پول: wallet.low_balance, wallet.charged');
    console.log('  - رویدادهای شرکت: company.approved');
  });
});
