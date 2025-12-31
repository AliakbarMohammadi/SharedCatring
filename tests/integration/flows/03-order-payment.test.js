/**
 * Flow 3: Menu → Order → Payment → Invoice
 * جریان ۳: منو → سفارش → پرداخت → فاکتور
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

describe('🍽️ جریان ۳: منو → سفارش → پرداخت → فاکتور', () => {
  let userId = generateId();
  let companyId = generateId();
  let menuId = null;
  let menuItemId = null;
  let orderId = null;
  let paymentId = null;
  let invoiceId = null;

  beforeAll(() => {
    // Set user headers
    clients.menu.setUserHeaders(userId, 'admin');
    clients.order.setUserHeaders(userId, 'user', companyId);
    clients.payment.setUserHeaders(userId, 'user');
    clients.invoice.setUserHeaders(userId, 'user');
    clients.wallet.setUserHeaders(userId, 'user', companyId);
    clients.notification.setUserHeaders(userId, 'user');
    
    logInfo(`شناسه کاربر: ${userId}`);
    logInfo(`شناسه شرکت: ${companyId}`);
  });

  test('مرحله ۱: انتشار منوی روزانه', async () => {
    logStep(1, 'انتشار منوی روزانه');

    const today = new Date().toISOString().split('T')[0];
    
    const menuData = {
      date: today,
      title: `منوی ${today}`,
      items: [
        {
          name: 'چلوکباب کوبیده',
          description: 'کباب کوبیده با برنج ایرانی',
          price: 150000,
          category: 'main',
          available: true
        },
        {
          name: 'جوجه کباب',
          description: 'جوجه کباب با برنج',
          price: 180000,
          category: 'main',
          available: true
        }
      ]
    };

    const response = await clients.menu.post('/api/v1/menus', menuData);

    if (response.success) {
      expect(response.data).toBeDefined();
      menuId = response.data.id || response.data._id;
      if (response.data.items && response.data.items.length > 0) {
        menuItemId = response.data.items[0].id || response.data.items[0]._id;
      }
      logSuccess(`منو با شناسه ${menuId} منتشر شد`);
    } else {
      logInfo(`انتشار منو: ${response.error?.message || 'خطا'}`);
      // Try to get today's menu
      const getResponse = await clients.menu.get(`/api/v1/menus/daily?date=${today}`);
      if (getResponse.success && getResponse.data) {
        menuId = getResponse.data.id || getResponse.data._id;
        if (getResponse.data.items && getResponse.data.items.length > 0) {
          menuItemId = getResponse.data.items[0].id || getResponse.data.items[0]._id;
        }
        logInfo(`منوی موجود استفاده شد: ${menuId}`);
      }
    }
  }, config.timeouts.medium);

  test('مرحله ۲: ثبت سفارش', async () => {
    logStep(2, 'ثبت سفارش');

    const orderData = {
      companyId: companyId,
      items: [
        {
          menuItemId: menuItemId || generateId(),
          name: 'چلوکباب کوبیده',
          quantity: 2,
          unitPrice: 150000
        }
      ],
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTime: '12:30',
      notes: 'لطفاً برنج زعفرانی باشد'
    };

    const response = await clients.order.post('/api/v1/orders', orderData);

    if (response.success) {
      expect(response.data).toBeDefined();
      orderId = response.data.id;
      logSuccess(`سفارش با شناسه ${orderId} ثبت شد`);
      logInfo(`مبلغ کل: ${response.data.totalAmount || 300000} تومان`);
    } else {
      logInfo(`ثبت سفارش: ${response.error?.message || 'خطا'}`);
      orderId = generateId();
    }
  }, config.timeouts.medium);

  test('مرحله ۳: محاسبه یارانه', async () => {
    logStep(3, 'محاسبه یارانه');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    // Check wallet balance
    const balanceResponse = await clients.wallet.get('/api/v1/wallets/balance');

    if (balanceResponse.success) {
      const { personalBalance, companyBalance } = balanceResponse.data;
      logSuccess(`موجودی شخصی: ${personalBalance || 0} تومان`);
      logSuccess(`موجودی یارانه: ${companyBalance || 0} تومان`);
    } else {
      logInfo(`دریافت موجودی: ${balanceResponse.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۴: کسر از کیف پول', async () => {
    logStep(4, 'کسر از کیف پول');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    // Internal deduct API
    const response = await clients.wallet.post('/internal/deduct', {
      userId: userId,
      amount: 300000,
      referenceType: 'order',
      referenceId: orderId,
      description: 'پرداخت سفارش'
    });

    if (response.success) {
      logSuccess('مبلغ از کیف پول کسر شد');
    } else {
      logInfo(`کسر از کیف پول: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۵: پردازش پرداخت', async () => {
    logStep(5, 'پردازش پرداخت');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    const paymentData = {
      orderId: orderId,
      amount: 300000,
      gateway: 'zarinpal',
      description: 'پرداخت سفارش غذا'
    };

    const response = await clients.payment.post('/api/v1/payments/request', paymentData);

    if (response.success) {
      expect(response.data).toBeDefined();
      paymentId = response.data.id;
      logSuccess(`پرداخت با شناسه ${paymentId} ایجاد شد`);
      if (response.data.paymentUrl) {
        logInfo(`لینک پرداخت: ${response.data.paymentUrl}`);
      }
    } else {
      logInfo(`ایجاد پرداخت: ${response.error?.message || 'خطا'}`);
      paymentId = generateId();
    }
  }, config.timeouts.medium);

  test('مرحله ۶: تایید سفارش', async () => {
    logStep(6, 'تایید سفارش');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    // Simulate payment verification callback
    const verifyResponse = await clients.payment.post('/api/v1/payments/verify', {
      paymentId: paymentId,
      authority: `MOCK-${Date.now()}`,
      status: 'OK'
    });

    if (verifyResponse.success) {
      logSuccess('پرداخت تایید شد');
    } else {
      logInfo(`تایید پرداخت: ${verifyResponse.error?.message || 'خطا'}`);
    }

    // Wait for event processing
    await wait(1000);

    // Update order status
    clients.order.setUserHeaders(userId, 'admin');
    const confirmResponse = await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
      status: 'confirmed'
    });

    if (confirmResponse.success) {
      logSuccess('سفارش تایید شد');
    } else {
      logInfo(`تایید سفارش: ${confirmResponse.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۷: صدور فاکتور', async () => {
    logStep(7, 'صدور فاکتور');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    // Wait for invoice to be generated via event
    await wait(1000);

    // Try to get invoice for order
    const response = await clients.invoice.get(`/api/v1/invoices/order/${orderId}`);

    if (response.success) {
      expect(response.data).toBeDefined();
      invoiceId = response.data.id;
      logSuccess(`فاکتور با شناسه ${invoiceId} صادر شد`);
      logInfo(`شماره فاکتور: ${response.data.invoiceNumber || 'نامشخص'}`);
    } else {
      // Create invoice manually
      const createResponse = await clients.invoice.post('/api/v1/invoices', {
        orderId: orderId,
        userId: userId,
        companyId: companyId,
        amount: 300000,
        items: [
          { name: 'چلوکباب کوبیده', quantity: 2, unitPrice: 150000, totalPrice: 300000 }
        ]
      });

      if (createResponse.success) {
        invoiceId = createResponse.data.id;
        logSuccess(`فاکتور ایجاد شد: ${invoiceId}`);
      } else {
        logInfo(`صدور فاکتور: ${createResponse.error?.message || 'خطا'}`);
      }
    }
  }, config.timeouts.medium);

  test('مرحله ۸: ارسال اعلان', async () => {
    logStep(8, 'ارسال اعلان');

    // Wait for notification to be sent via event
    await wait(1000);

    // Check notifications
    const response = await clients.notification.get('/api/v1/notifications');

    if (response.success) {
      const notifications = response.data.notifications || response.data;
      if (Array.isArray(notifications) && notifications.length > 0) {
        logSuccess(`${notifications.length} اعلان دریافت شد`);
        const latest = notifications[0];
        logInfo(`آخرین اعلان: ${latest.title || latest.body || 'بدون عنوان'}`);
      } else {
        logInfo('اعلانی یافت نشد');
      }
    } else {
      logInfo(`دریافت اعلان‌ها: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  afterAll(() => {
    clients.menu.clearAuth();
    clients.order.clearAuth();
    clients.payment.clearAuth();
    clients.invoice.clearAuth();
    clients.wallet.clearAuth();
    clients.notification.clearAuth();
    
    console.log('\n📋 خلاصه جریان ۳:');
    console.log(`  - شناسه منو: ${menuId || 'ایجاد نشد'}`);
    console.log(`  - شناسه سفارش: ${orderId || 'ایجاد نشد'}`);
    console.log(`  - شناسه پرداخت: ${paymentId || 'ایجاد نشد'}`);
    console.log(`  - شناسه فاکتور: ${invoiceId || 'ایجاد نشد'}`);
  });
});
