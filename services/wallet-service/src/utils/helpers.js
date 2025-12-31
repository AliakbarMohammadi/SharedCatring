const formatPrice = (amount) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

const transactionTypeLabels = {
  topup_personal: 'شارژ کیف پول شخصی',
  topup_company: 'شارژ کیف پول سازمانی',
  subsidy_allocation: 'تخصیص یارانه',
  order_payment: 'پرداخت سفارش',
  order_refund: 'استرداد سفارش',
  subsidy_expiry: 'انقضای یارانه',
  withdrawal: 'برداشت',
  transfer_in: 'انتقال دریافتی',
  transfer_out: 'انتقال ارسالی',
  adjustment: 'تعدیل موجودی'
};

const balanceTypeLabels = {
  personal: 'شخصی',
  company: 'سازمانی'
};

module.exports = {
  formatPrice,
  transactionTypeLabels,
  balanceTypeLabels
};
