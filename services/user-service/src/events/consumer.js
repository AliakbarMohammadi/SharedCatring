const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');
const { handleUserCreated } = require('./subscribers/userCreated.subscriber');

class EventConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'catering_events';
    this.queue = 'user-service-queue';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });

      // Subscribe to events
      await this.channel.bindQueue(this.queue, this.exchange, 'identity.user.created');

      this.channel.consume(this.queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;

            logger.debug('رویداد دریافت شد', { routingKey });

            if (routingKey === 'identity.user.created') {
              await handleUserCreated(content);
            }

            this.channel.ack(msg);
          } catch (error) {
            logger.error('خطا در پردازش رویداد', { error: error.message });
            this.channel.nack(msg, false, false);
          }
        }
      });

      logger.info('اتصال به RabbitMQ برقرار شد و در حال گوش دادن به رویدادها');

      this.connection.on('close', () => {
        logger.warn('اتصال RabbitMQ بسته شد');
        setTimeout(() => this.connect(), 5000);
      });

    } catch (error) {
      logger.error('خطا در اتصال به RabbitMQ', { error: error.message });
      setTimeout(() => this.connect(), 5000);
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      logger.info('اتصال RabbitMQ بسته شد');
    } catch (error) {
      logger.error('خطا در بستن اتصال RabbitMQ', { error: error.message });
    }
  }
}

module.exports = new EventConsumer();
