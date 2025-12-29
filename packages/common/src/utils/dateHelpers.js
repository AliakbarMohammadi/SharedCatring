const moment = require('moment-jalaali');

// Configure moment-jalaali for Persian locale
moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });

/**
 * Date helper utilities with Persian (Jalaali) calendar support
 */

/**
 * Convert Gregorian date to Jalaali (Persian) date
 * @param {Date|string} date - Gregorian date
 * @param {string} format - Output format (default: 'jYYYY/jMM/jDD')
 * @returns {string} Formatted Jalaali date
 */
const toJalaali = (date, format = 'jYYYY/jMM/jDD') => {
  return moment(date).format(format);
};

/**
 * Convert Jalaali date to Gregorian date
 * @param {string} jalaaliDate - Jalaali date string (e.g., '1402/10/15')
 * @param {string} inputFormat - Input format
 * @returns {Date} Gregorian date
 */
const toGregorian = (jalaaliDate, inputFormat = 'jYYYY/jMM/jDD') => {
  return moment(jalaaliDate, inputFormat).toDate();
};

/**
 * Get current Jalaali date
 * @param {string} format - Output format
 * @returns {string} Current Jalaali date
 */
const nowJalaali = (format = 'jYYYY/jMM/jDD') => {
  return moment().format(format);
};

/**
 * Get current Jalaali date and time
 * @returns {string} Current Jalaali date and time
 */
const nowJalaaliWithTime = () => {
  return moment().format('jYYYY/jMM/jDD HH:mm:ss');
};

/**
 * Format date for display in Persian
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date in Persian
 */
const formatPersianDate = (date) => {
  return moment(date).format('jD jMMMM jYYYY');
};

/**
 * Format date and time for display in Persian
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time in Persian
 */
const formatPersianDateTime = (date) => {
  return moment(date).format('jD jMMMM jYYYY - HH:mm');
};

/**
 * Get relative time in Persian
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
const relativeTime = (date) => {
  return moment(date).fromNow();
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
const isPast = (date) => {
  return moment(date).isBefore(moment());
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
const isFuture = (date) => {
  return moment(date).isAfter(moment());
};

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date}
 */
const startOfDay = (date = new Date()) => {
  return moment(date).startOf('day').toDate();
};

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date}
 */
const endOfDay = (date = new Date()) => {
  return moment(date).endOf('day').toDate();
};

/**
 * Add days to date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date}
 */
const addDays = (date, days) => {
  return moment(date).add(days, 'days').toDate();
};

/**
 * Get Persian weekday name
 * @param {Date|string} date - Date
 * @returns {string} Persian weekday name
 */
const getPersianWeekday = (date) => {
  const weekdays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  return weekdays[moment(date).day()];
};

module.exports = {
  toJalaali,
  toGregorian,
  nowJalaali,
  nowJalaaliWithTime,
  formatPersianDate,
  formatPersianDateTime,
  relativeTime,
  isToday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  addDays,
  getPersianWeekday,
  moment // Export moment for advanced usage
};
