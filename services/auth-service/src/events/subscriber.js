const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');
const { Session } = require('../models');
const tokenService = require('../services/token.service');

/**
 * Event Subscriber for Auth Service
 * گوش دادن به رویدادهای Identity Service برای همگام‌سازی
 */
class EventSubscriber {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'catering_events';
    this.queue = 'auth-service-queue';
    this.isConnected = false;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });
      
      // Bind to identity events that affect authentication
      await this.channel.bindQueue(this.queue, this.exchange, 'identity.role.assigned');
      await this.channel.bindQueue(this.queue, this.exchange, 'identity.user.updated');
      await this.channel.bindQueue(this.queue, this.exchange, 'identity.user.deleted');
      
      this.isConnected = true;
      logger.info('Auth Event Subscriber متصل شد به RabbitMQ');

      // Start consuming
      this.consume();

      this.connection.on('close', () => {
        this.isConnected = false;
        logger.warn('اتصال Auth Subscriber به RabbitMQ بسته شد');
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      logger.error('خطا در اتصال Auth Subscriber به RabbitMQ', { error: error.message });
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

        logger.info('Auth Service: رویداد دریافت شد', { routingKey });

        await this.handleEvent(routingKey, content);
        this.channel.ack(msg);
      } catch (error) {
        logger.error('خطا در پردازش رویداد در Auth Service', { error: error.message });
        this.channel.nack(msg, false, false);
      }
    });

    logger.info('Auth Service شروع به گوش دادن به رویدادها کرد');
  }

  async handleEvent(routingKey, data) {
    switch (routingKey) {
      case 'identity.role.assigned':
        await this.handleRoleAssigned(data);
        break;
      case 'identity.user.updated':
        await this.handleUserUpdated(data);
        break;
      case 'identity.user.deleted':
        await this.handleUserDeleted(data);
        break;
      default:
        logger.debug('رویداد ناشناخته در Auth Service', { routingKey });
    }
  }

  /**
   * Handle role assignment - invalidate all user tokens
   * وقتی نقش کاربر تغییر می‌کند، همه توکن‌ها باطل می‌شوند
   */
  async handleRoleAssigned(data) {
    const { userId, roleName } = data;

    if (!userId) {
      logger.warn('داده‌های ناقص در رویداد identity.role.assigned', { data });
      return;
    }

    try {
      // Revoke all refresh tokens for this user
      await tokenService.revokeAllUserTokens(userId, 'refresh');

      // Deactivate all sessions
      await Session.deactivateAllUserSessions(userId);

      logger.info('توکن‌های کاربر باطل شد (تغییر نقش)', { 
        userId, 
        newRole: roleName 
      });
    } catch (error) {
      logger.error('خطا در باطل کردن توکن‌ها پس از تغییر نقش', { 
        userId, 
        error: error.message 
      });
    }
  }

  /**
   * Handle user update - check if critical fields changed
   */
  async handleUserUpdated(data) {
    const { userId, changes } = data;

    if (!userId) return;

    // If companyId changed, invalidate tokens
    if (changes && changes.hasOwnProperty('companyId')) {
      try {
        await tokenService.revokeAllUserTokens(userId, 'refresh');
        await Session.deactivateAllUserSessions(userId);

        logger.info('توکن‌های کاربر باطل شد (تغییر شرکت)', { 
          userId, 
          newCompanyId: changes.companyId 
        });
      } catch (error) {
        logger.error('خطا در باطل کردن توکن‌ها پس از تغییر شرکت', { 
          userId, 
          error: error.message 
        });
      }
    }
  }

  /**
   * Handle user deletion - invalidate all tokens
   */
  async handleUserDeleted(data) {
    const { userId } = data;

    if (!userId) return;

    try {
      await tokenService.revokeAllUserTokens(userId);
      await Session.deactivateAllUserSessions(userId);

      logger.info('توکن‌های کاربر حذف شده باطل شد', { userId });
    } catch (error) {
      logger.error('خطا در باطل کردن توکن‌های کاربر حذف شده', { 
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
