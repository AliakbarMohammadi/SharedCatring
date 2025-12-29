// Error Codes
const ERROR_CODES = {
  // General Errors (1000-1099)
  INTERNAL_ERROR: 'ERR_1000',
  VALIDATION_ERROR: 'ERR_1001',
  NOT_FOUND: 'ERR_1002',
  UNAUTHORIZED: 'ERR_1003',
  FORBIDDEN: 'ERR_1004',
  BAD_REQUEST: 'ERR_1005',
  CONFLICT: 'ERR_1006',
  RATE_LIMIT_EXCEEDED: 'ERR_1007',
  SERVICE_UNAVAILABLE: 'ERR_1008',

  // Auth Errors (1100-1199)
  INVALID_CREDENTIALS: 'ERR_1100',
  TOKEN_EXPIRED: 'ERR_1101',
  TOKEN_INVALID: 'ERR_1102',
  REFRESH_TOKEN_EXPIRED: 'ERR_1103',
  ACCOUNT_DISABLED: 'ERR_1104',
  ACCOUNT_LOCKED: 'ERR_1105',
  PASSWORD_WEAK: 'ERR_1106',
  OTP_INVALID: 'ERR_1107',
  OTP_EXPIRED: 'ERR_1108',

  // User Errors (1200-1299)
  USER_NOT_FOUND: 'ERR_1200',
  USER_ALREADY_EXISTS: 'ERR_1201',
  EMAIL_ALREADY_EXISTS: 'ERR_1202',
  PHONE_ALREADY_EXISTS: 'ERR_1203',
  INVALID_USER_STATUS: 'ERR_1204',

  // Company Errors (1300-1399)
  COMPANY_NOT_FOUND: 'ERR_1300',
  COMPANY_ALREADY_EXISTS: 'ERR_1301',
  INVALID_COMPANY_STATUS: 'ERR_1302',
  COMPANY_SUBSCRIPTION_EXPIRED: 'ERR_1303',

  // Menu Errors (1400-1499)
  MENU_NOT_FOUND: 'ERR_1400',
  MENU_ITEM_NOT_FOUND: 'ERR_1401',
  CATEGORY_NOT_FOUND: 'ERR_1402',
  MENU_NOT_AVAILABLE: 'ERR_1403',
  ITEM_OUT_OF_STOCK: 'ERR_1404',

  // Order Errors (1500-1599)
  ORDER_NOT_FOUND: 'ERR_1500',
  ORDER_ALREADY_CANCELLED: 'ERR_1501',
  ORDER_CANNOT_BE_MODIFIED: 'ERR_1502',
  ORDER_DEADLINE_PASSED: 'ERR_1503',
  INVALID_ORDER_STATUS: 'ERR_1504',
  MINIMUM_ORDER_NOT_MET: 'ERR_1505',

  // Payment Errors (1600-1699)
  PAYMENT_FAILED: 'ERR_1600',
  PAYMENT_NOT_FOUND: 'ERR_1601',
  INSUFFICIENT_BALANCE: 'ERR_1602',
  INVALID_PAYMENT_METHOD: 'ERR_1603',
  PAYMENT_ALREADY_PROCESSED: 'ERR_1604',

  // Wallet Errors (1700-1799)
  WALLET_NOT_FOUND: 'ERR_1700',
  WALLET_ALREADY_EXISTS: 'ERR_1701',
  INSUFFICIENT_WALLET_BALANCE: 'ERR_1702',
  INVALID_TRANSACTION: 'ERR_1703',
  WITHDRAWAL_LIMIT_EXCEEDED: 'ERR_1704',

  // Invoice Errors (1800-1899)
  INVOICE_NOT_FOUND: 'ERR_1800',
  INVOICE_ALREADY_PAID: 'ERR_1801',
  INVOICE_CANCELLED: 'ERR_1802',

  // File Errors (1900-1999)
  FILE_NOT_FOUND: 'ERR_1900',
  FILE_TOO_LARGE: 'ERR_1901',
  INVALID_FILE_TYPE: 'ERR_1902',
  FILE_UPLOAD_FAILED: 'ERR_1903'
};

// User Roles
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  COMPANY_MANAGER: 'company_manager',
  EMPLOYEE: 'employee',
  KITCHEN_STAFF: 'kitchen_staff',
  DELIVERY_STAFF: 'delivery_staff'
};

// User Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

// Company Status
const COMPANY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Payment Methods
const PAYMENT_METHODS = {
  WALLET: 'wallet',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
};

// Invoice Status
const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Notification Types
const NOTIFICATION_TYPES = {
  SMS: 'sms',
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'in_app'
};

// Transaction Types
const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PAYMENT: 'payment',
  REFUND: 'refund',
  TRANSFER: 'transfer',
  BONUS: 'bonus'
};

// Event Names
const EVENTS = {
  // User Events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_STATUS_CHANGED: 'user.status.changed',

  // Auth Events
  USER_LOGGED_IN: 'auth.login',
  USER_LOGGED_OUT: 'auth.logout',
  PASSWORD_CHANGED: 'auth.password.changed',
  PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',

  // Company Events
  COMPANY_CREATED: 'company.created',
  COMPANY_UPDATED: 'company.updated',
  COMPANY_STATUS_CHANGED: 'company.status.changed',

  // Order Events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  ORDER_CANCELLED: 'order.cancelled',

  // Payment Events
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Wallet Events
  WALLET_CREATED: 'wallet.created',
  WALLET_CREDITED: 'wallet.credited',
  WALLET_DEBITED: 'wallet.debited',

  // Invoice Events
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',

  // Notification Events
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_FAILED: 'notification.failed'
};

// Queue Names
const QUEUES = {
  AUTH_QUEUE: 'auth_queue',
  USER_QUEUE: 'user_queue',
  COMPANY_QUEUE: 'company_queue',
  ORDER_QUEUE: 'order_queue',
  PAYMENT_QUEUE: 'payment_queue',
  WALLET_QUEUE: 'wallet_queue',
  INVOICE_QUEUE: 'invoice_queue',
  NOTIFICATION_QUEUE: 'notification_queue',
  FILE_QUEUE: 'file_queue',
  REPORTING_QUEUE: 'reporting_queue'
};

module.exports = {
  ERROR_CODES,
  USER_ROLES,
  USER_STATUS,
  COMPANY_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  INVOICE_STATUS,
  NOTIFICATION_TYPES,
  TRANSACTION_TYPES,
  EVENTS,
  QUEUES
};
