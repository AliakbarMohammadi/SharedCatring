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

      this.connection.on('error', (err) => {
        logger.error('خطای RabbitMQ', { error: err.message });
      });

      return this.channel;
    } catch (error) {
      logger.error('خطا در اتصال به RabbitMQ', { error: error.message });
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(routingKey, message) {
    if (!this.channel) {
      logger.warn('کانال RabbitMQ در دسترس نیست');
      return false;
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        source: config.serviceName
      }));

      this.channel.publish(this.exchange, routingKey, messageBuffer, {
        persistent: true,
        contentType: 'application/json'
      });

      logger.debug('رویداد منتشر شد', { routingKey, message });
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
      this.isConnected = false;
      logger.info('اتصال RabbitMQ بسته شد');
    } catch (error) {
      logger.error('خطا در بستن اتصال RabbitMQ', { error: error.message });
    }
  }
}

module.exports = new EventPublisher();
