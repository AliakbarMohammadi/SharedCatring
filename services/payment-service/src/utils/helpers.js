const crypto = require('crypto');

const generateTrackingCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

const formatPrice = (amount) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

const paymentStatusLabels = {
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش',
  completed: 'پرداخت شده',
  failed: 'ناموفق',
  refunded: 'مسترد شده',
  cancelled: 'لغو شده'
};

const paymentMethodLabels = {
  online: 'پرداخت آنلاین',
  wallet: 'کیف پول',
  card: 'کارت به کارت',
  cash: 'نقدی'
};

const gatewayLabels = {
  zarinpal: 'زرین‌پال',
  idpay: 'آیدی‌پی',
  mock: 'درگاه تست'
};

module.exports = {
  generateTrackingCode,
  formatPrice,
  paymentStatusLabels,
  paymentMethodLabels,
  gatewayLabels
};
