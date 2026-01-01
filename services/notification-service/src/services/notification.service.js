const { Notification, Template, UserPreference } = require('../models');
const emailService = require('./email.service');
const smsService = require('./sms.service');
const { replaceTemplateVariables, notificationStatusLabels, notificationTypeLabels, notificationCategoryLabels, toJalaliDateTime } = require('../utils/helpers');
const logger = require('../utils/logger');

class NotificationService {
  // Get or create user preferences
  async getOrCreatePreferences(userId) {
    let prefs = await UserPreference.findOne({ userId });
    if (!prefs) {
      prefs = await UserPreference.create({ userId });
    }
    return prefs;
  }

  // Update user preferences
  async updatePreferences(userId, updates) {
    const prefs = await UserPreference.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    return prefs;
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, type, status, category } = options;
    const skip = (page - 1) * limit;

    const query = { userId, type: 'in_app' };
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query)
    ]);

    return {
      notifications: notifications.map(n => this.formatNotification(n)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get unread count
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      userId,
      type: 'in_app',
      status: { $in: ['pending', 'sent'] }
    });
    return count;
  }

  // Mark as read
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { status: 'read', readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw {
        statusCode: 404,
        code: 'ERR_NOTIFICATION_NOT_FOUND',
        message: 'اعلان یافت نشد'
      };
    }

    return this.formatNotification(notification);
  }

  // Mark all as read
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { userId, type: 'in_app', status: { $in: ['pending', 'sent'] } },
      { status: 'read', readAt: new Date() }
    );
    return { modifiedCount: result.modifiedCount };
  }

  // Send notification (main method)
  async send(options) {
    const {
      userId,
      type,
      category = 'system',
      title,
      body,
      data = {},
      templateName,
      variables = {},
      recipient = {}
    } = options;

    // Check user preferences
    const prefs = await this.getOrCreatePreferences(userId);
    
    // Check if category is enabled
    if (!prefs.categories[category]) {
      logger.debug('دسته‌بندی اعلان غیرفعال است', { userId, category });
      return null;
    }

    // Check if notification type is enabled
    if (type === 'email' && !prefs.email.enabled) {
      logger.debug('ایمیل غیرفعال است', { userId });
      return null;
    }
    if (type === 'sms' && !prefs.sms.enabled) {
      logger.debug('پیامک غیرفعال است', { userId });
      return null;
    }

    // Get template if specified
    let finalTitle = title;
    let finalBody = body;
    let subject = title;

    if (templateName) {
      const template = await Template.findOne({ name: templateName, isActive: true });
      if (template) {
        finalBody = replaceTemplateVariables(template.body, variables);
        if (template.subject) {
          subject = replaceTemplateVariables(template.subject, variables);
          finalTitle = subject;
        }
      }
    }

    // Create notification record
    const notification = await Notification.create({
      userId,
      type,
      category,
      title: finalTitle,
      body: finalBody,
      data,
      status: 'pending',
      recipient: {
        email: recipient.email || prefs.email.address,
        phone: recipient.phone || prefs.sms.phone
      }
    });

    // Send based on type
    let result;
    try {
      switch (type) {
        case 'email':
          result = await emailService.send(
            notification.recipient.email,
            subject,
            finalBody
          );
          break;
        case 'sms':
          result = await smsService.send(
            notification.recipient.phone,
            finalBody
          );
          break;
        case 'in_app':
          result = { success: true };
          break;
        case 'push':
          // Push notifications - logged for future implementation
          logger.info('Push notification queued', { userId, title: finalTitle });
          result = { success: true, provider: 'push', note: 'Push notification logged' };
          break;
      }

      if (result.success) {
        notification.status = type === 'in_app' ? 'sent' : 'sent';
        notification.sentAt = new Date();
      } else {
        notification.status = 'failed';
        notification.error = result.error;
      }
    } catch (error) {
      notification.status = 'failed';
      notification.error = error.message;
      notification.retryCount += 1;
    }

    await notification.save();
    
    logger.info('اعلان ارسال شد', { 
      notificationId: notification._id, 
      type, 
      status: notification.status 
    });

    return this.formatNotification(notification);
  }

  // Send to multiple users
  async sendBulk(userIds, options) {
    const results = await Promise.all(
      userIds.map(userId => this.send({ ...options, userId }))
    );
    return results.filter(r => r !== null);
  }

  // Send notification from event
  async sendFromEvent(eventName, eventData) {
    const handlers = {
      'order.created': this.handleOrderCreated.bind(this),
      'order.confirmed': this.handleOrderConfirmed.bind(this),
      'order.ready': this.handleOrderReady.bind(this),
      'order.delivered': this.handleOrderDelivered.bind(this),
      'payment.completed': this.handlePaymentCompleted.bind(this),
      'company.approved': this.handleCompanyApproved.bind(this),
      'wallet.low_balance': this.handleWalletLowBalance.bind(this),
      'wallet.charged': this.handleWalletCharged.bind(this)
    };

    const handler = handlers[eventName];
    if (handler) {
      await handler(eventData);
    }
  }

  // Event handlers
  async handleOrderCreated(data) {
    await this.send({
      userId: data.userId,
      type: 'in_app',
      category: 'order',
      title: 'سفارش ثبت شد',
      body: `سفارش شما با شماره ${data.orderNumber} با موفقیت ثبت شد.`,
      data: { orderId: data.orderId, orderNumber: data.orderNumber }
    });

    if (data.email) {
      await this.send({
        userId: data.userId,
        type: 'email',
        category: 'order',
        templateName: 'order_created',
        variables: {
          orderNumber: data.orderNumber,
          totalAmount: data.totalAmount,
          deliveryDate: data.deliveryDate
        },
        recipient: { email: data.email }
      });
    }
  }

  async handleOrderConfirmed(data) {
    await this.send({
      userId: data.userId,
      type: 'in_app',
      category: 'order',
      title: 'سفارش تایید شد',
      body: `سفارش ${data.orderNumber} تایید شد و در حال آماده‌سازی است.`,
      data: { orderId: data.orderId }
    });

    if (data.phone) {
      await this.send({
        userId: data.userId,
        type: 'sms',
        category: 'order',
        templateName: 'order_confirmed_sms',
        variables: { orderNumber: data.orderNumber },
        recipient: { phone: data.phone }
      });
    }
  }

  async handleOrderReady(data) {
    await this.send({
      userId: data.userId,
      type: 'in_app',
      category: 'order',
      title: 'سفارش آماده تحویل',
      body: `سفارش ${data.orderNumber} آماده تحویل است.`,
      data: { orderId: data.orderId }
    });

    if (data.phone) {
      await this.send({
        userId: data.userId,
        type: 'sms',
        category: 'order',
        templateName: 'order_ready_sms',
        variables: { orderNumber: data.orderNumber },
        recipient: { phone: data.phone }
      });
    }
  }

  async handleOrderDelivered(data) {
    await this.send({
      userId: data.userId,
      type: 'in_app',
      category: 'order',
      title: 'سفارش تحویل داده شد',
      body: `سفارش ${data.orderNumber} با موفقیت تحویل داده شد. نوش جان!`,
      data: { orderId: data.orderId }
    });
  }

  async handlePaymentCompleted(data) {
    await this.send({
      userId: data.userId,
      type: 'in_app',
      category: 'payment',
      title: 'پرداخت موفق',
      body: `پرداخت شما به مبلغ ${data.amount?.toLocaleString('fa-IR')} تومان با موفقیت انجام شد.`,
      data: { paymentId: data.paymentId, amount: data.amount }
    });
  }

  async handleCompanyApproved(data) {
    await this.send({
      userId: data.userId,
      type: 'email',
      category: 'company',
      templateName: 'company_approved',
      variables: {
        companyName: data.companyName
      },
      recipient: { email: data.email }
    });

    await this.send({
      userId: data.userId,
      type: 'in_app',
      category: 'company',
      title: 'شرکت تایید شد',
      body: `شرکت ${data.companyName} با موفقیت تایید شد.`,
      data: { companyId: data.companyId }
    });
  }

  async handleWalletLowBalance(data) {
    await this.send({
      userId: data.userId,
      type: 'in_app',
      category: 'wallet',
      title: 'هشدار موجودی کم',
      body: `موجودی کیف پول شما به ${data.balance?.toLocaleString('fa-IR')} تومان رسیده است.`,
      data: { balance: data.balance }
    });
  }

  async handleWalletCharged(data) {
    await this.send({
      userId: data.userId,
      type: 'in_app',
      category: 'wallet',
      title: 'شارژ کیف پول',
      body: `کیف پول شما به مبلغ ${data.amount?.toLocaleString('fa-IR')} تومان شارژ شد.`,
      data: { amount: data.amount, newBalance: data.newBalance }
    });
  }

  formatNotification(notification) {
    return {
      id: notification._id,
      userId: notification.userId,
      type: notification.type,
      typeLabel: notificationTypeLabels[notification.type],
      category: notification.category,
      categoryLabel: notificationCategoryLabels[notification.category],
      title: notification.title,
      body: notification.body,
      data: notification.data,
      status: notification.status,
      statusLabel: notificationStatusLabels[notification.status],
      readAt: notification.readAt,
      readAtJalali: toJalaliDateTime(notification.readAt),
      sentAt: notification.sentAt,
      sentAtJalali: toJalaliDateTime(notification.sentAt),
      createdAt: notification.createdAt,
      createdAtJalali: toJalaliDateTime(notification.createdAt)
    };
  }
}

module.exports = new NotificationService();
