const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');

class EventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'catering_events';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      
      logger.info('اتصال به RabbitMQ برقرار شد');

      this.connection.on('error', (err) => {
        logger.error('خطای اتصال RabbitMQ', { error: err.message });
      });

      this.connection.on('close', () => {
        logger.warn('اتصال RabbitMQ بسته شد');
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      logger.error('خطا در اتصال به RabbitMQ', { error: error.message });
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(routingKey, message) {
    try {
      if (!this.channel) {
        logger.warn('کانال RabbitMQ موجود نیست');
        return false;
      }

      const messageBuffer = Buffer.from(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        source: config.serviceName
      }));

      this.channel.publish(this.exchange, routingKey, messageBuffer, {
        persistent: true,
        contentType: 'application/json'
      });

      logger.debug('رویداد منتشر شد', { routingKey });
      return true;
    } catch (error) {
      logger.error('خطا در انتشار رویداد', { error: error.message, routingKey });
      return false;
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (error) {
      logger.error('خطا در بستن اتصال RabbitMQ', { error: error.message });
    }
  }
}

module.exports = new EventPublisher();
