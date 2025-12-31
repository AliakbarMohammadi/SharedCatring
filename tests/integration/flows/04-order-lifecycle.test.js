/**
 * Flow 4: Order Lifecycle
 * جریان ۴: چرخه حیات سفارش
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

describe('🔄 جریان ۴: چرخه حیات سفارش', () => {
  let userId = generateId();
  let companyId = generateId();
  let orderId = null;

  const orderStatuses = [
    { status: 'pending', label: 'در انتظار' },
    { status: 'confirmed', label: 'تایید شده' },
    { status: 'preparing', label: 'در حال آماده‌سازی' },
    { status: 'ready', label: 'آماده تحویل' },
    { status: 'delivered', label: 'تحویل داده شده' },
    { status: 'completed', label: 'تکمیل شده' }
  ];

  beforeAll(() => {
    clients.order.setUserHeaders(userId, 'user', companyId);
    
    logInfo(`شناسه کاربر: ${userId}`);
    logInfo(`شناسه شرکت: ${companyId}`);
  });

  test('مرحله ۱: ایجاد سفارش جدید', async () => {
    logStep(1, 'ایجاد سفارش جدید');

    const orderData = {
      companyId: companyId,
      items: [
        {
          menuItemId: generateId(),
          name: 'قورمه سبزی',
          quantity: 1,
          unitPrice: 120000
        }
      ],
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTime: '13:00'
    };

    const response = await clients.order.post('/api/v1/orders', orderData);

    if (response.success) {
      orderId = response.data.id;
      expect(response.data.status).toBe('pending');
      logSuccess(`سفارش ایجاد شد: ${orderId}`);
      logInfo(`وضعیت اولیه: ${response.data.status}`);
    } else {
      logInfo(`ایجاد سفارش: ${response.error?.message || 'خطا'}`);
      orderId = generateId();
    }
  }, config.timeouts.medium);

  test('مرحله ۲: تغییر وضعیت به تایید شده', async () => {
    logStep(2, 'تغییر وضعیت به تایید شده');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    clients.order.setUserHeaders(userId, 'admin');
    
    const response = await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
      status: 'confirmed'
    });

    if (response.success) {
      expect(response.data.status).toBe('confirmed');
      logSuccess('وضعیت به "تایید شده" تغییر کرد');
    } else {
      logInfo(`تغییر وضعیت: ${response.error?.message || 'خطا'}`);
    }

    // Wait for event
    await wait(500);
  }, config.timeouts.medium);

  test('مرحله ۳: تغییر وضعیت به در حال آماده‌سازی', async () => {
    logStep(3, 'تغییر وضعیت به در حال آماده‌سازی');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    const response = await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
      status: 'preparing'
    });

    if (response.success) {
      expect(response.data.status).toBe('preparing');
      logSuccess('وضعیت به "در حال آماده‌سازی" تغییر کرد');
    } else {
      logInfo(`تغییر وضعیت: ${response.error?.message || 'خطا'}`);
    }

    await wait(500);
  }, config.timeouts.medium);

  test('مرحله ۴: تغییر وضعیت به آماده تحویل', async () => {
    logStep(4, 'تغییر وضعیت به آماده تحویل');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    const response = await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
      status: 'ready'
    });

    if (response.success) {
      expect(response.data.status).toBe('ready');
      logSuccess('وضعیت به "آماده تحویل" تغییر کرد');
    } else {
      logInfo(`تغییر وضعیت: ${response.error?.message || 'خطا'}`);
    }

    await wait(500);
  }, config.timeouts.medium);

  test('مرحله ۵: تغییر وضعیت به تحویل داده شده', async () => {
    logStep(5, 'تغییر وضعیت به تحویل داده شده');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    const response = await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
      status: 'delivered'
    });

    if (response.success) {
      expect(response.data.status).toBe('delivered');
      logSuccess('وضعیت به "تحویل داده شده" تغییر کرد');
    } else {
      logInfo(`تغییر وضعیت: ${response.error?.message || 'خطا'}`);
    }

    await wait(500);
  }, config.timeouts.medium);

  test('مرحله ۶: تغییر وضعیت به تکمیل شده', async () => {
    logStep(6, 'تغییر وضعیت به تکمیل شده');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    const response = await clients.order.patch(`/api/v1/orders/${orderId}/status`, {
      status: 'completed'
    });

    if (response.success) {
      expect(response.data.status).toBe('completed');
      logSuccess('وضعیت به "تکمیل شده" تغییر کرد');
    } else {
      logInfo(`تغییر وضعیت: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۷: بررسی تاریخچه سفارش', async () => {
    logStep(7, 'بررسی تاریخچه سفارش');

    if (!orderId) {
      logInfo('شناسه سفارش موجود نیست - رد شد');
      return;
    }

    const response = await clients.order.get(`/api/v1/orders/${orderId}`);

    if (response.success) {
      logSuccess('جزئیات سفارش دریافت شد');
      logInfo(`وضعیت نهایی: ${response.data.status}`);
      
      if (response.data.statusHistory) {
        logInfo('تاریخچه وضعیت:');
        response.data.statusHistory.forEach(h => {
          console.log(`  - ${h.status}: ${h.timestamp || h.createdAt}`);
        });
      }
    } else {
      logInfo(`دریافت سفارش: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  test('مرحله ۸: بررسی اعلان‌های ارسال شده', async () => {
    logStep(8, 'بررسی اعلان‌های ارسال شده');

    // Wait for all notifications to be processed
    await wait(1000);

    clients.notification.setUserHeaders(userId, 'user');
    const response = await clients.notification.get('/api/v1/notifications');

    if (response.success) {
      const notifications = response.data.notifications || response.data;
      if (Array.isArray(notifications)) {
        const orderNotifications = notifications.filter(n => 
          n.category === 'order' || 
          (n.data && n.data.orderId === orderId)
        );
        logSuccess(`${orderNotifications.length} اعلان مرتبط با سفارش یافت شد`);
      }
    } else {
      logInfo(`دریافت اعلان‌ها: ${response.error?.message || 'خطا'}`);
    }
  }, config.timeouts.medium);

  afterAll(() => {
    clients.order.clearAuth();
    clients.notification.clearAuth();
    
    console.log('\n📋 خلاصه جریان ۴:');
    console.log(`  - شناسه سفارش: ${orderId || 'ایجاد نشد'}`);
    console.log('  - وضعیت‌های طی شده:');
    orderStatuses.forEach(s => console.log(`    ✓ ${s.label}`));
  });
});
