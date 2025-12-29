const RabbitMQClient = require('./RabbitMQClient');

/**
 * Base subscriber class for consuming events
 */
class BaseSubscriber {
  constructor(queueName, client = null) {
    this.queueName = queueName;
    this.client = client || RabbitMQClient.getInstance();
    this.handlers = new Map();
    this.isConsuming = false;
  }

  /**
   * Subscribe to event patterns
   * @param {string|Array} patterns - Event pattern(s) to subscribe to
   * @param {Function} handler - Event handler function
   * @param {Object} options - Subscription options
   */
  async subscribe(patterns, handler, options = {}) {
    const channel = await this.client.getChannel();

    // Create queue
    await channel.assertQueue(this.queueName, {
      durable: true,
      ...options.queueOptions
    });

    // Bind patterns
    const patternArray = Array.isArray(patterns) ? patterns : [patterns];
    for (const pattern of patternArray) {
      await channel.bindQueue(this.queueName, this.client.exchange, pattern);
      this.handlers.set(pattern, handler);
      console.log(`اشتراک در الگو: ${pattern}`);
    }

    // Start consuming if not already
    if (!this.isConsuming) {
      await this.startConsuming(options);
    }
  }

  /**
   * Start consuming messages
   */
  async startConsuming(options = {}) {
    const channel = await this.client.getChannel();

    // Set prefetch
    await channel.prefetch(options.prefetch || 10);

    this.isConsuming = true;

    await channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const eventType = content.event;

        console.log(`رویداد دریافت شد: ${eventType}`, {
          correlationId: content.metadata?.correlationId
        });

        // Find matching handler
        let handler = null;
        for (const [pattern, h] of this.handlers) {
          if (this.matchPattern(pattern, eventType)) {
            handler = h;
            break;
          }
        }

        if (handler) {
          await handler(content.data, content.metadata, msg);
        }

        channel.ack(msg);
      } catch (error) {
        console.error('خطا در پردازش پیام:', error.message);
        await this.handleError(msg, error, options);
      }
    });

    console.log(`شروع مصرف از صف: ${this.queueName}`);
  }

  /**
   * Handle message processing error
   */
  async handleError(msg, error, options = {}) {
    const channel = await this.client.getChannel();
    const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;
    const maxRetries = options.maxRetries || 3;

    if (retryCount <= maxRetries) {
      // Requeue with delay
      console.log(`تلاش مجدد ${retryCount}/${maxRetries}`);
      setTimeout(() => {
        channel.nack(msg, false, true);
      }, options.retryDelay || 5000);
    } else {
      // Send to dead letter queue or discard
      console.error('پیام پس از چند تلاش ناموفق حذف شد');
      channel.nack(msg, false, false);
    }
  }

  /**
   * Match routing key pattern
   */
  matchPattern(pattern, routingKey) {
    if (pattern === '#') return true;
    if (pattern === routingKey) return true;

    const patternParts = pattern.split('.');
    const keyParts = routingKey.split('.');

    let pi = 0;
    let ki = 0;

    while (pi < patternParts.length && ki < keyParts.length) {
      if (patternParts[pi] === '#') return true;
      if (patternParts[pi] === '*' || patternParts[pi] === keyParts[ki]) {
        pi++;
        ki++;
      } else {
        return false;
      }
    }

    return pi === patternParts.length && ki === keyParts.length;
  }

  /**
   * Unsubscribe from queue
   */
  async unsubscribe() {
    const channel = await this.client.getChannel();
    await channel.cancel(this.queueName);
    this.isConsuming = false;
    this.handlers.clear();
    console.log(`لغو اشتراک از صف: ${this.queueName}`);
  }
}

module.exports = BaseSubscriber;
