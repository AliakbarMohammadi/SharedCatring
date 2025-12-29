/**
 * Centralized event types for the catering system
 */

const EventTypes = {
  // User events
  USER: {
    CREATED: 'user.created',
    UPDATED: 'user.updated',
    DELETED: 'user.deleted',
    STATUS_CHANGED: 'user.status.changed',
    PASSWORD_CHANGED: 'user.password.changed',
    PROFILE_UPDATED: 'user.profile.updated'
  },

  // Auth events
  AUTH: {
    LOGIN: 'auth.login',
    LOGOUT: 'auth.logout',
    REGISTER: 'auth.register',
    PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',
    PASSWORD_RESET_COMPLETED: 'auth.password.reset.completed',
    TOKEN_REFRESHED: 'auth.token.refreshed',
    ACCOUNT_LOCKED: 'auth.account.locked',
    ACCOUNT_UNLOCKED: 'auth.account.unlocked'
  },

  // Company events
  COMPANY: {
    CREATED: 'company.created',
    UPDATED: 'company.updated',
    DELETED: 'company.deleted',
    STATUS_CHANGED: 'company.status.changed',
    EMPLOYEE_ADDED: 'company.employee.added',
    EMPLOYEE_REMOVED: 'company.employee.removed',
    SUBSCRIPTION_UPDATED: 'company.subscription.updated'
  },

  // Menu events
  MENU: {
    ITEM_CREATED: 'menu.item.created',
    ITEM_UPDATED: 'menu.item.updated',
    ITEM_DELETED: 'menu.item.deleted',
    ITEM_AVAILABILITY_CHANGED: 'menu.item.availability.changed',
    CATEGORY_CREATED: 'menu.category.created',
    CATEGORY_UPDATED: 'menu.category.updated',
    CATEGORY_DELETED: 'menu.category.deleted',
    DAILY_MENU_CREATED: 'menu.daily.created',
    DAILY_MENU_UPDATED: 'menu.daily.updated'
  },

  // Order events
  ORDER: {
    CREATED: 'order.created',
    UPDATED: 'order.updated',
    STATUS_CHANGED: 'order.status.changed',
    CONFIRMED: 'order.confirmed',
    PREPARING: 'order.preparing',
    READY: 'order.ready',
    DELIVERED: 'order.delivered',
    CANCELLED: 'order.cancelled',
    ITEM_ADDED: 'order.item.added',
    ITEM_REMOVED: 'order.item.removed'
  },

  // Payment events
  PAYMENT: {
    INITIATED: 'payment.initiated',
    PROCESSING: 'payment.processing',
    COMPLETED: 'payment.completed',
    FAILED: 'payment.failed',
    REFUNDED: 'payment.refunded',
    CANCELLED: 'payment.cancelled'
  },

  // Wallet events
  WALLET: {
    CREATED: 'wallet.created',
    CREDITED: 'wallet.credited',
    DEBITED: 'wallet.debited',
    TRANSFER_SENT: 'wallet.transfer.sent',
    TRANSFER_RECEIVED: 'wallet.transfer.received',
    BALANCE_LOW: 'wallet.balance.low'
  },

  // Invoice events
  INVOICE: {
    CREATED: 'invoice.created',
    ISSUED: 'invoice.issued',
    PAID: 'invoice.paid',
    OVERDUE: 'invoice.overdue',
    CANCELLED: 'invoice.cancelled',
    REMINDER_SENT: 'invoice.reminder.sent'
  },

  // Notification events
  NOTIFICATION: {
    SEND: 'notification.send',
    SENT: 'notification.sent',
    FAILED: 'notification.failed',
    READ: 'notification.read'
  },

  // File events
  FILE: {
    UPLOADED: 'file.uploaded',
    DELETED: 'file.deleted',
    PROCESSED: 'file.processed'
  },

  // System events
  SYSTEM: {
    HEALTH_CHECK: 'system.health.check',
    MAINTENANCE_START: 'system.maintenance.start',
    MAINTENANCE_END: 'system.maintenance.end',
    ERROR: 'system.error'
  }
};

/**
 * Get all event types as flat array
 */
EventTypes.getAllEvents = () => {
  const events = [];
  const traverse = (obj) => {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string') {
        events.push(value);
      } else if (typeof value === 'object') {
        traverse(value);
      }
    }
  };
  traverse(EventTypes);
  return events;
};

/**
 * Check if event type is valid
 */
EventTypes.isValid = (eventType) => {
  return EventTypes.getAllEvents().includes(eventType);
};

module.exports = EventTypes;
