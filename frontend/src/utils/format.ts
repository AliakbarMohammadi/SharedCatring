/**
 * Formatting Utilities
 * توابع فرمت‌بندی برای نمایش فارسی
 */

import jalaliMoment from 'jalali-moment';

/**
 * Convert English digits to Persian digits
 * تبدیل اعداد انگلیسی به فارسی
 */
export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Format number in Persian format with thousand separators
 * فرمت‌بندی عدد با جداکننده هزارگان فارسی
 */
export function formatPersianNumber(num: number): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(num);
  return formatted;
}

/**
 * Format price in Persian format with تومان suffix
 * فرمت‌بندی قیمت با پسوند تومان
 */
export function formatPrice(amount: number): string {
  if (amount === 0) return 'رایگان';
  const formatted = formatPersianNumber(amount);
  return `${formatted} تومان`;
}

/**
 * Format date to Persian (Shamsi) calendar
 * فرمت‌بندی تاریخ به تقویم شمسی
 */
export function formatPersianDate(date: Date | string, format: string = 'jYYYY/jMM/jDD'): string {
  return jalaliMoment(date).locale('fa').format(format);
}

/**
 * Format date to Persian with day name
 * فرمت‌بندی تاریخ با نام روز
 */
export function formatPersianDateFull(date: Date | string): string {
  return jalaliMoment(date).locale('fa').format('dddd jD jMMMM jYYYY');
}

/**
 * Format relative time in Persian
 * فرمت‌بندی زمان نسبی به فارسی
 */
export function formatRelativeTime(date: Date | string): string {
  return jalaliMoment(date).locale('fa').fromNow();
}

/**
 * Format time in Persian
 * فرمت‌بندی ساعت به فارسی
 */
export function formatPersianTime(date: Date | string): string {
  return jalaliMoment(date).locale('fa').format('HH:mm');
}

/**
 * Get today's date in Persian format
 * دریافت تاریخ امروز به فرمت فارسی
 */
export function getTodayPersian(): string {
  return jalaliMoment().locale('fa').format('dddd jD jMMMM jYYYY');
}

/**
 * Order status labels in Persian
 * برچسب‌های وضعیت سفارش به فارسی
 */
export const orderStatusLabels: Record<string, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده تحویل',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

/**
 * Order status colors for badges
 * رنگ‌های وضعیت سفارش برای badge
 */
export const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

/**
 * Transaction type labels in Persian
 * برچسب‌های نوع تراکنش به فارسی
 */
export const transactionTypeLabels: Record<string, string> = {
  credit: 'واریز',
  debit: 'برداشت',
};

/**
 * Meal type labels in Persian
 * برچسب‌های وعده غذایی به فارسی
 */
export const mealTypeLabels: Record<string, string> = {
  breakfast: 'صبحانه',
  lunch: 'ناهار',
  dinner: 'شام',
};
