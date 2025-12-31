const moment = require('moment-jalaali');

moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

const toJalali = (date, format = 'jYYYY/jMM/jDD') => {
  if (!date) return null;
  return moment(date).format(format);
};

const toJalaliDateTime = (date) => {
  if (!date) return null;
  return moment(date).format('jYYYY/jMM/jDD - HH:mm');
};

const formatPrice = (amount) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[d]);
};

const notificationTypeLabels = {
  email: 'ایمیل',
  sms: 'پیامک',
  push: 'اعلان فوری',
  in_app: 'اعلان درون‌برنامه‌ای'
};

const notificationStatusLabels = {
  pending: 'در انتظار ارسال',
  sent: 'ارسال شده',
  failed: 'ناموفق',
  read: 'خوانده شده'
};

const notificationCategoryLabels = {
  order: 'سفارش',
  payment: 'پرداخت',
  wallet: 'کیف پول',
  company: 'شرکت',
  system: 'سیستم',
  promotion: 'تخفیف'
};

// Template variable replacer
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
};

module.exports = {
  toJalali,
  toJalaliDateTime,
  formatPrice,
  toPersianDigits,
  notificationTypeLabels,
  notificationStatusLabels,
  notificationCategoryLabels,
  replaceTemplateVariables
};
