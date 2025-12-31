const moment = require('moment-jalaali');

moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });

const toJalali = (date, format = 'jYYYY/jMM/jDD') => {
  if (!date) return null;
  return moment(date).format(format);
};

const toJalaliDateTime = (date) => {
  if (!date) return null;
  return moment(date).format('jYYYY/jMM/jDD - HH:mm');
};

const getJalaliMonthName = (monthNumber) => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[monthNumber - 1] || '';
};

const getCurrentJalaliDate = () => {
  const now = moment();
  return {
    year: now.jYear(),
    month: now.jMonth() + 1,
    day: now.jDate(),
    formatted: now.format('jYYYY/jMM/jDD'),
    monthName: getJalaliMonthName(now.jMonth() + 1)
  };
};

const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return '۰ تومان';
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '۰';
  return new Intl.NumberFormat('fa-IR').format(num);
};

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[d]);
};

const getDateRange = (period, date = new Date()) => {
  const m = moment(date);
  
  switch (period) {
    case 'today':
      return {
        start: m.startOf('day').toDate(),
        end: m.endOf('day').toDate()
      };
    case 'yesterday':
      return {
        start: m.subtract(1, 'day').startOf('day').toDate(),
        end: m.endOf('day').toDate()
      };
    case 'week':
      return {
        start: m.startOf('week').toDate(),
        end: m.endOf('week').toDate()
      };
    case 'month':
      return {
        start: m.startOf('jMonth').toDate(),
        end: m.endOf('jMonth').toDate()
      };
    case 'year':
      return {
        start: m.startOf('jYear').toDate(),
        end: m.endOf('jYear').toDate()
      };
    default:
      return {
        start: m.startOf('day').toDate(),
        end: m.endOf('day').toDate()
      };
  }
};

module.exports = {
  toJalali,
  toJalaliDateTime,
  getJalaliMonthName,
  getCurrentJalaliDate,
  formatPrice,
  formatNumber,
  toPersianDigits,
  getDateRange
};
