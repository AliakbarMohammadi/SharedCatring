/**
 * Auth Validation Schemas
 * اسکیماهای اعتبارسنجی احراز هویت
 */

import { z } from 'zod';

/**
 * Login form validation schema
 * اسکیمای اعتبارسنجی فرم ورود
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'ایمیل الزامی است')
    .email('فرمت ایمیل نامعتبر است'),
  password: z
    .string()
    .min(1, 'رمز عبور الزامی است')
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register form validation schema
 * اسکیمای اعتبارسنجی فرم ثبت‌نام
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'ایمیل الزامی است')
      .email('فرمت ایمیل نامعتبر است'),
    phone: z
      .string()
      .min(1, 'شماره موبایل الزامی است')
      .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'),
    password: z
      .string()
      .min(1, 'رمز عبور الزامی است')
      .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
    confirmPassword: z
      .string()
      .min(1, 'تکرار رمز عبور الزامی است'),
    role: z.enum(['personal_user', 'company_admin'], {
      required_error: 'نوع کاربری را انتخاب کنید',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن مطابقت ندارند',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;


/**
 * Forgot password form validation schema
 * اسکیمای اعتبارسنجی فرم فراموشی رمز عبور
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'ایمیل الزامی است')
    .email('فرمت ایمیل نامعتبر است'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password form validation schema
 * اسکیمای اعتبارسنجی فرم بازنشانی رمز عبور
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'رمز عبور الزامی است')
      .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
    confirmPassword: z
      .string()
      .min(1, 'تکرار رمز عبور الزامی است'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن مطابقت ندارند',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
