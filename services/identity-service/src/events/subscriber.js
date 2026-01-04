const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');
const userService = require('../services/user.service');
const { Role } = require('../models');

class EventSubscriber {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'catering_events';
    this.queue = 'identity-service-queue';
    this.isConnected = false;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });
      
      // Bind to employee events
      await this.channel.bindQueue(this.queue, this.exchange, 'employee.added');
      await this.channel.bindQueue(this.queue, this.exchange, 'employee.removed');
      
      this.isConnected = true;
      logger.info('Event Subscriber متصل شد به RabbitMQ');

      // Start consuming
      this.consume();

      this.connection.on('close', () => {
        this.isConnected = false;
        logger.warn('اتصال Subscriber به RabbitMQ بسته شد');
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      logger.error('خطا در اتصال Subscriber به RabbitMQ', { error: error.message });
      setTimeout(() => this.connect(), 5000);
    }
  }

  async consume() {
    if (!this.channel) return;

    this.channel.consume(this.queue, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;

        logger.info('رویداد دریافت شد', { routingKey, content });

        await this.handleEvent(routingKey, content);
        this.channel.ack(msg);
      } catch (error) {
        logger.error('خطا در پردازش رویداد', { error: error.message });
        // Reject and don't requeue on parse errors
        this.channel.nack(msg, false, false);
      }
    });

    logger.info('شروع به گوش دادن به رویدادها');
  }

  async handleEvent(routingKey, data) {
    switch (routingKey) {
      case 'employee.added':
        await this.handleEmployeeAdded(data);
        break;
      case 'employee.removed':
        await this.handleEmployeeRemoved(data);
        break;
      default:
        logger.debug('رویداد ناشناخته', { routingKey });
    }
  }

  /**
   * Handle employee.added event
   * Update user role to 'employee' and set companyId
   */
  async handleEmployeeAdded(data) {
    const { userId, companyId } = data;

    if (!userId || !companyId) {
      logger.warn('داده‌های ناقص در رویداد employee.added', { data });
      return;
    }

    try {
      // Find employee role
      const employeeRole = await Role.findOne({ where: { name: 'employee' } });
      if (!employeeRole) {
        logger.error('نقش employee یافت نشد');
        return;
      }

      // Update user with role and companyId
      await userService.update(userId, { companyId });
      await userService.assignRole(userId, employeeRole.id);

      logger.info('کاربر به عنوان کارمند آپدیت شد', { userId, companyId, roleId: employeeRole.id });
    } catch (error) {
      logger.error('خطا در آپدیت کاربر پس از افزودن کارمند', { 
        userId, 
        companyId, 
        error: error.message 
      });
    }
  }

  /**
   * Handle employee.removed event
   * Reset user role to 'personal_user' and clear companyId
   */
  async handleEmployeeRemoved(data) {
    const { userId } = data;

    if (!userId) {
      logger.warn('داده‌های ناقص در رویداد employee.removed', { data });
      return;
    }

    try {
      // Find personal_user role
      const personalRole = await Role.findOne({ where: { name: 'personal_user' } });
      if (!personalRole) {
        logger.error('نقش personal_user یافت نشد');
        return;
      }

      // Update user - reset to personal user
      await userService.update(userId, { companyId: null });
      await userService.assignRole(userId, personalRole.id);

      logger.info('کاربر از کارمندی خارج شد', { userId });
    } catch (error) {
      logger.error('خطا در آپدیت کاربر پس از حذف کارمند', { 
        userId, 
        error: error.message 
      });
    }
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.isConnected = false;
  }
}

module.exports = new EventSubscriber();
