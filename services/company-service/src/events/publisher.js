const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');

class EventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'catering_events';
    this.isConnected = false;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      this.isConnected = true;
      logger.info('اتصال به RabbitMQ برقرار شد');

      this.connection.on('close', () => {
        this.isConnected = false;
        logger.warn('اتصال RabbitMQ بسته شد');
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      logger.error('خطا در اتصال به RabbitMQ', { error: error.message });
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(routingKey, message) {
    if (!this.channel) return false;
    try {
      const buffer = Buffer.from(JSON.stringify({ ...message, timestamp: new Date().toISOString(), source: config.serviceName }));
      this.channel.publish(this.exchange, routingKey, buffer, { persistent: true, contentType: 'application/json' });
      logger.debug('رویداد منتشر شد', { routingKey });
      return true;
    } catch (error) {
      logger.error('خطا در انتشار رویداد', { error: error.message });
      return false;
    }
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.isConnected = false;
  }
}

module.exports = new EventPublisher();
