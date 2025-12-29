/**
 * Company and user status constants
 */

const COMPANY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
};

const COMPANY_STATUS_LABELS = {
  [COMPANY_STATUS.ACTIVE]: 'فعال',
  [COMPANY_STATUS.INACTIVE]: 'غیرفعال',
  [COMPANY_STATUS.PENDING]: 'در انتظار تأیید',
  [COMPANY_STATUS.SUSPENDED]: 'تعلیق شده'
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'فعال',
  [USER_STATUS.INACTIVE]: 'غیرفعال',
  [USER_STATUS.PENDING]: 'در انتظار تأیید',
  [USER_STATUS.SUSPENDED]: 'تعلیق شده',
  [USER_STATUS.DELETED]: 'حذف شده'
};

// Invoice status
const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.DRAFT]: 'پیش‌نویس',
  [INVOICE_STATUS.ISSUED]: 'صادر شده',
  [INVOICE_STATUS.PAID]: 'پرداخت شده',
  [INVOICE_STATUS.OVERDUE]: 'سررسید گذشته',
  [INVOICE_STATUS.CANCELLED]: 'لغو شده'
};

// Wallet transaction types
const TRANSACTION_TYPE = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PAYMENT: 'payment',
  REFUND: 'refund',
  TRANSFER: 'transfer',
  BONUS: 'bonus'
};

const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPE.DEPOSIT]: 'واریز',
  [TRANSACTION_TYPE.WITHDRAWAL]: 'برداشت',
  [TRANSACTION_TYPE.PAYMENT]: 'پرداخت',
  [TRANSACTION_TYPE.REFUND]: 'بازگشت وجه',
  [TRANSACTION_TYPE.TRANSFER]: 'انتقال',
  [TRANSACTION_TYPE.BONUS]: 'پاداش'
};

// Notification types
const NOTIFICATION_TYPE = {
  ORDER_CREATED: 'order_created',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_READY: 'order_ready',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  WALLET_CREDITED: 'wallet_credited',
  WALLET_DEBITED: 'wallet_debited',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
};

const NOTIFICATION_CHANNEL = {
  SMS: 'sms',
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'in_app'
};

module.exports = {
  COMPANY_STATUS,
  COMPANY_STATUS_LABELS,
  USER_STATUS,
  USER_STATUS_LABELS,
  INVOICE_STATUS,
  INVOICE_STATUS_LABELS,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LABELS,
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL
};
