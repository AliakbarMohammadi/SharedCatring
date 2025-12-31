const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Get start of day
 */
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 */
const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get week start (Saturday for Persian calendar)
 */
const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 6 ? 0 : -(day + 1);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Format price to Persian
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('fa-IR').format(price);
};

/**
 * Order status labels in Persian
 */
const orderStatusLabels = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده تحویل',
  delivered: 'تحویل داده شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  rejected: 'رد شده'
};

/**
 * Meal type labels in Persian
 */
const mealTypeLabels = {
  breakfast: 'صبحانه',
  lunch: 'ناهار',
  dinner: 'شام'
};

module.exports = {
  generateOrderNumber,
  getStartOfDay,
  getEndOfDay,
  getWeekStart,
  formatPrice,
  orderStatusLabels,
  mealTypeLabels
};
