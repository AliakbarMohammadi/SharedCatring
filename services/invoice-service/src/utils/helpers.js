const moment = require('moment-jalaali');
const config = require('../config');

// Configure moment-jalaali
moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

/**
 * Generate sequential invoice number
 * Format: INV-YYMM-XXXX (e.g., INV-1403-0001)
 */
const generateInvoiceNumber = async (sequenceGetter) => {
  const jDate = moment();
  const year = jDate.jYear().toString().slice(-2);
  const month = (jDate.jMonth() + 1).toString().padStart(2, '0');
  const prefix = `INV-${year}${month}`;
  
  // Get next sequence number
  const sequence = await sequenceGetter(prefix);
  const seqStr = sequence.toString().padStart(4, '0');
  
  return `${prefix}-${seqStr}`;
};

/**
 * Convert Gregorian date to Jalali (Persian)
 */
const toJalali = (date, format = 'jYYYY/jMM/jDD') => {
  if (!date) return null;
  return moment(date).format(format);
};

/**
 * Convert Jalali to Gregorian
 */
const toGregorian = (jDate, format = 'YYYY-MM-DD') => {
  if (!jDate) return null;
  return moment(jDate, 'jYYYY/jMM/jDD').format(format);
};

/**
 * Format price with Persian digits and currency
 */
const formatPrice = (amount, withCurrency = true) => {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return withCurrency ? `${formatted} ${config.currency.name}` : formatted;
};

/**
 * Format number to Persian digits
 */
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[d]);
};

/**
 * Calculate tax amount
 */
const calculateTax = (subtotal, taxRate = config.tax.defaultRate) => {
  return Math.round((subtotal * taxRate) / 100);
};

/**
 * Invoice status labels in Persian
 */
const invoiceStatusLabels = {
  draft: 'پیش‌نویس',
  issued: 'صادر شده',
  sent: 'ارسال شده',
  paid: 'پرداخت شده',
  cancelled: 'لغو شده'
};

/**
 * Invoice type labels in Persian
 */
const invoiceTypeLabels = {
  instant: 'فوری',
  consolidated: 'تجمیعی',
  proforma: 'پیش‌فاکتور'
};

/**
 * Get Persian month name
 */
const getPersianMonthName = (monthNumber) => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[monthNumber - 1] || '';
};

/**
 * Get current Jalali date info
 */
const getCurrentJalaliDate = () => {
  const now = moment();
  return {
    year: now.jYear(),
    month: now.jMonth() + 1,
    day: now.jDate(),
    formatted: now.format('jYYYY/jMM/jDD'),
    monthName: getPersianMonthName(now.jMonth() + 1)
  };
};

module.exports = {
  generateInvoiceNumber,
  toJalali,
  toGregorian,
  formatPrice,
  toPersianDigits,
  calculateTax,
  invoiceStatusLabels,
  invoiceTypeLabels,
  getPersianMonthName,
  getCurrentJalaliDate
};
