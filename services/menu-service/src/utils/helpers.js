const slugify = require('slugify');

/**
 * Generate slug from Persian/English text
 */
const generateSlug = (text) => {
  return slugify(text, {
    replacement: '-',
    lower: true,
    strict: true,
    locale: 'fa'
  });
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
 * Get week range (Saturday to Friday for Persian calendar)
 */
const getWeekRange = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToSaturday = day === 6 ? 0 : -(day + 1);
  
  const start = new Date(d);
  start.setDate(d.getDate() + diffToSaturday);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Format price to Persian
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('fa-IR').format(price);
};

module.exports = {
  generateSlug,
  getStartOfDay,
  getEndOfDay,
  getWeekRange,
  formatPrice
};
