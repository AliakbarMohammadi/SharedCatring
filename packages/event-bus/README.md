# @catering/event-bus

کلاینت RabbitMQ برای ارتباط رویداد-محور در سیستم کترینگ

## نصب

```bash
npm install @catering/event-bus
```

## استفاده

### اتصال به RabbitMQ

```javascript
const { RabbitMQClient } = require('@catering/event-bus');

const client = RabbitMQClient.getInstance({
  host: 'localhost',
  port: 5672,
  user: 'guest',
  password: 'guest'
});

await client.connect();
```

### انتشار رویداد (Publisher)

```javascript
const { BasePublisher, EventTypes } = require('@catering/event-bus');

const publisher = new BasePublisher();

// انتشار رویداد ساده
await publisher.publish(EventTypes.ORDER.CREATED, {
  orderId: '123',
  userId: '456',
  total: 150000
});

// انتشار با گزینه‌های اضافی
await publisher.publish(EventTypes.PAYMENT.COMPLETED, {
  paymentId: '789',
  amount: 150000
}, {
  correlationId: 'custom-id',
  source: 'payment-service'
});

// انتشار دسته‌ای
await publisher.publishBatch([
  { eventType: EventTypes.ORDER.CONFIRMED, data: { orderId: '123' } },
  { eventType: EventTypes.NOTIFICATION.SEND, data: { userId: '456', message: 'سفارش تأیید شد' } }
]);
```

### دریافت رویداد (Subscriber)

```javascript
const { BaseSubscriber, EventTypes } = require('@catering/event-bus');

const subscriber = new BaseSubscriber('order-service-queue');

// اشتراک در یک رویداد
await subscriber.subscribe(EventTypes.PAYMENT.COMPLETED, async (data, metadata) => {
  console.log('پرداخت انجام شد:', data);
  // پردازش رویداد
});

// اشتراک در چند رویداد
await subscriber.subscribe(
  [EventTypes.ORDER.CREATED, EventTypes.ORDER.CANCELLED],
  async (data, metadata) => {
    console.log('رویداد سفارش:', data);
  }
);

// اشتراک با الگو (wildcard)
await subscriber.subscribe('order.*', async (data, metadata) => {
  console.log('رویداد سفارش:', metadata.event);
});

// اشتراک در همه رویدادها
await subscriber.subscribe('#', async (data, metadata) => {
  console.log('رویداد:', metadata.event);
});
```

### انواع رویدادها

```javascript
const { EventTypes } = require('@catering/event-bus');

// دسترسی به انواع رویداد
EventTypes.USER.CREATED      // 'user.created'
EventTypes.ORDER.CONFIRMED   // 'order.confirmed'
EventTypes.PAYMENT.COMPLETED // 'payment.completed'

// دریافت همه رویدادها
const allEvents = EventTypes.getAllEvents();

// بررسی معتبر بودن رویداد
EventTypes.isValid('order.created'); // true
```

## متغیرهای محیطی

| متغیر | توضیحات | پیش‌فرض |
|-------|---------|---------|
| RABBITMQ_HOST | آدرس سرور | localhost |
| RABBITMQ_PORT | پورت | 5672 |
| RABBITMQ_USER | نام کاربری | guest |
| RABBITMQ_PASSWORD | رمز عبور | guest |
| RABBITMQ_VHOST | Virtual Host | / |

## ساختار پیام

```json
{
  "event": "order.created",
  "data": {
    "orderId": "123",
    "userId": "456"
  },
  "metadata": {
    "correlationId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "source": "order-service",
    "version": "1.0"
  }
}
```
