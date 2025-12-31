const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');

class EventSubscriber {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'catering_events';
    this.queue = 'order_service_queue';
    this.handlers = {};
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });
      
      // Bind to relevant events
      await this.channel.bindQueue(this.queue, this.exchange, 'payment.completed');
      await this.channel.bindQueue(this.queue, this.exchange, 'payment.failed');
      
      await this.channel.consume(this.queue, (msg) => this.handleMessage(msg), { noAck: false });
      
      logger.info('شروع دریافت رویدادها از RabbitMQ');
    } catch (error) {
      logger.error('خطا در اتصال subscriber به RabbitMQ', { error: error.message });
      setTimeout(() => this.connect(), 5000);
    }
  }

  registerHandler(routingKey, handler) {
    this.handlers[routingKey] = handler;
  }

  async handleMessage(msg) {
    if (!msg) return;

    try {
      const routingKey = msg.fields.routingKey;
      const content = JSON.parse(msg.content.toString());
      
      logger.debug('رویداد دریافت شد', { routingKey });

      const handler = this.handlers[routingKey];
      if (handler) {
        await handler(content);
      }

      this.channel.ack(msg);
    } catch (error) {
      logger.error('خطا در پردازش رویداد', { error: error.message });
      this.channel.nack(msg, false, false);
    }
  }
}

module.exports = new EventSubscriber();
