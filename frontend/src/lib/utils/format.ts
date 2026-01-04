/**
 * Formatting Utilities - Persian Localization
 * ابزارهای فرمت‌بندی - بومی‌سازی فارسی
 */

import jalaliMoment from 'jalali-moment';

// Persian digits mapping
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Convert number to Persian digits
 * تبدیل عدد به ارقام فارسی
 */
export function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Convert Persian digits to English
 * تبدیل ارقام فارسی به انگلیسی
 */
export function toEnglishDigits(str: string): string {
  return str.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)));
}

/**
 * Format price in Toman with Persian digits
 * فرمت قیمت به تومان با ارقام فارسی
 */
export function formatPrice(amount: number, showCurrency = true): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return showCurrency ? `${formatted} تومان` : formatted;
}

/**
 * Format price in Rial
 * فرمت قیمت به ریال
 */
export function formatPriceRial(amount: number): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} ریال`;
}

/**
 * Format number with Persian digits and separators
 * فرمت عدد با ارقام فارسی و جداکننده
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num);
}

/**
 * Convert Gregorian date to Jalali
 * تبدیل تاریخ میلادی به شمسی
 */
export function toJalali(date: string | Date, format = 'jYYYY/jMM/jDD'): string {
  if (!date) return '';
  return jalaliMoment(date).locale('fa').format(format);
}

/**
 * Convert Jalali date to Gregorian
 * تبدیل تاریخ شمسی به میلادی
 */
export function toGregorian(jalaliDate: string, format = 'YYYY-MM-DD'): string {
  if (!jalaliDate) return '';
  return jalaliMoment.from(jalaliDate, 'fa', 'jYYYY/jMM/jDD').format(format);
}

/**
 * Format date and time in Jalali
 * فرمت تاریخ و زمان به شمسی
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  return jalaliMoment(date).locale('fa').format('jYYYY/jMM/jDD - HH:mm');
}

/**
 * Format relative time in Persian
 * فرمت زمان نسبی به فارسی
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return '';
  return jalaliMoment(date).locale('fa').fromNow();
}

/**
 * Get Jalali day name
 * دریافت نام روز به شمسی
 */
export function getJalaliDayName(date: string | Date): string {
  if (!date) return '';
  return jalaliMoment(date).locale('fa').format('dddd');
}

/**
 * Get Jalali month name
 * دریافت نام ماه به شمسی
 */
export function getJalaliMonthName(date: string | Date): string {
  if (!date) return '';
  return jalaliMoment(date).locale('fa').format('jMMMM');
}

/**
 * Format phone number
 * فرمت شماره تلفن
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  // Format as 0912-345-6789
  if (digits.length === 11 && digits.startsWith('09')) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Format order number
 * فرمت شماره سفارش
 */
export function formatOrderNumber(orderNumber: string): string {
  return toPersianDigits(orderNumber);
}

/**
 * Get order status label in Persian
 * دریافت برچسب وضعیت سفارش به فارسی
 */
export const orderStatusLabels: Record<string, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده تحویل',
  delivered: 'تحویل داده شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  rejected: 'رد شده',
};

/**
 * Get order status color
 * دریافت رنگ وضعیت سفارش
 */
export const orderStatusColors: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  delivered: 'success',
  completed: 'success',
  cancelled: 'error',
  rejected: 'error',
};

/**
 * Get payment status label in Persian
 * دریافت برچسب وضعیت پرداخت به فارسی
 */
export const paymentStatusLabels: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش',
  completed: 'پرداخت شده',
  failed: 'ناموفق',
  refunded: 'مسترد شده',
};

/**
 * Get user role label in Persian
 * دریافت برچسب نقش کاربر به فارسی
 */
export const userRoleLabels: Record<string, string> = {
  super_admin: 'مدیر ارشد سیستم',
  catering_admin: 'مدیر کترینگ',
  kitchen_staff: 'پرسنل آشپزخانه',
  company_admin: 'مدیر شرکت',
  company_manager: 'مدیر واحد',
  employee: 'کارمند',
  personal_user: 'کاربر شخصی',
  // Legacy roles
  corporate_user: 'کاربر سازمانی',
  admin: 'مدیر سیستم',
};

/**
 * Truncate text with ellipsis
 * کوتاه کردن متن با سه‌نقطه
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format file size
 * فرمت حجم فایل
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '۰ بایت';
  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${toPersianDigits(size)} ${sizes[i]}`;
}

/**
 * Format percentage
 * فرمت درصد
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${toPersianDigits(value.toFixed(decimals))}٪`;
}

/**
 * Get today's date in Jalali
 * دریافت تاریخ امروز به شمسی
 */
export function getTodayJalali(): string {
  return jalaliMoment().locale('fa').format('jYYYY/jMM/jDD');
}

/**
 * Get current Jalali year
 * دریافت سال جاری شمسی
 */
export function getCurrentJalaliYear(): number {
  return jalaliMoment().jYear();
}

/**
 * Get current Jalali month
 * دریافت ماه جاری شمسی
 */
export function getCurrentJalaliMonth(): number {
  return jalaliMoment().jMonth() + 1;
}
