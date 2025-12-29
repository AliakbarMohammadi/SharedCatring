const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Event Publisher
 * ناشر رویدادها
 */
class EventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'catering_events';
    this.isConnected = false;
  }

  /**
   * Connect to RabbitMQ
   */
  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

      this.isConnected = true;
      logger.info('اتصال به RabbitMQ برقرار شد');

      // Handle connection close
      this.connection.on('close', () => {
        this.isConnected = false;
        logger.warn('اتصال RabbitMQ بسته شد');
        setTimeout(() => this.connect(), 5000);
      });

      this.connection.on('error', (err) => {
        logger.error('خطای RabbitMQ:', { error: err.message });
      });

    } catch (error) {
      logger.error('خطا در اتصال به RabbitMQ:', { error: error.message });
      this.isConnected = false;
      // Retry connection after 5 seconds
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * Publish event
   * @param {string} eventType - Event routing key
   * @param {Object} data - Event data
   */
  async publish(eventType, data) {
    if (!this.isConnected || !this.channel) {
      logger.warn('RabbitMQ متصل نیست، رویداد در صف قرار نگرفت', { eventType });
      return false;
    }

    try {
      const message = {
        eventType,
        data,
        timestamp: new Date().toISOString(),
        source: config.serviceName
      };

      this.channel.publish(
        this.exchange,
        eventType,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      logger.debug('رویداد منتشر شد', { eventType });
      return true;
    } catch (error) {
      logger.error('خطا در انتشار رویداد:', { eventType, error: error.message });
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.isConnected = false;
      logger.info('اتصال RabbitMQ بسته شد');
    } catch (error) {
      logger.error('خطا در بستن اتصال RabbitMQ:', { error: error.message });
    }
  }
}

module.exports = new EventPublisher();
