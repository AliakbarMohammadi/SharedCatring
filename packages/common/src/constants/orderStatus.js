/**
 * Order status constants and transitions
 */

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'در انتظار تأیید',
  [ORDER_STATUS.CONFIRMED]: 'تأیید شده',
  [ORDER_STATUS.PREPARING]: 'در حال آماده‌سازی',
  [ORDER_STATUS.READY]: 'آماده تحویل',
  [ORDER_STATUS.DELIVERED]: 'تحویل داده شده',
  [ORDER_STATUS.CANCELLED]: 'لغو شده'
};

const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.CONFIRMED]: 'info',
  [ORDER_STATUS.PREPARING]: 'primary',
  [ORDER_STATUS.READY]: 'success',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'danger'
};

// Valid status transitions
const ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: []
};

/**
 * Check if status transition is valid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - New status to transition to
 * @returns {boolean}
 */
const isValidTransition = (currentStatus, newStatus) => {
  const validTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  return validTransitions.includes(newStatus);
};

/**
 * Get next possible statuses
 * @param {string} currentStatus - Current order status
 * @returns {Array<string>}
 */
const getNextStatuses = (currentStatus) => {
  return ORDER_STATUS_TRANSITIONS[currentStatus] || [];
};

/**
 * Check if order can be cancelled
 * @param {string} status - Current order status
 * @returns {boolean}
 */
const canCancel = (status) => {
  return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING].includes(status);
};

/**
 * Check if order is in final state
 * @param {string} status - Current order status
 * @returns {boolean}
 */
const isFinalStatus = (status) => {
  return [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(status);
};

// Payment status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'در انتظار پرداخت',
  [PAYMENT_STATUS.PROCESSING]: 'در حال پردازش',
  [PAYMENT_STATUS.COMPLETED]: 'پرداخت شده',
  [PAYMENT_STATUS.FAILED]: 'ناموفق',
  [PAYMENT_STATUS.REFUNDED]: 'بازگشت داده شده',
  [PAYMENT_STATUS.CANCELLED]: 'لغو شده'
};

// Payment methods
const PAYMENT_METHOD = {
  WALLET: 'wallet',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
};

const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.WALLET]: 'کیف پول',
  [PAYMENT_METHOD.CARD]: 'کارت بانکی',
  [PAYMENT_METHOD.BANK_TRANSFER]: 'انتقال بانکی',
  [PAYMENT_METHOD.CASH]: 'نقدی'
};

// Meal types
const MEAL_TYPE = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack'
};

const MEAL_TYPE_LABELS = {
  [MEAL_TYPE.BREAKFAST]: 'صبحانه',
  [MEAL_TYPE.LUNCH]: 'ناهار',
  [MEAL_TYPE.DINNER]: 'شام',
  [MEAL_TYPE.SNACK]: 'میان‌وعده'
};

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_TRANSITIONS,
  isValidTransition,
  getNextStatuses,
  canCancel,
  isFinalStatus,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABELS,
  MEAL_TYPE,
  MEAL_TYPE_LABELS
};
