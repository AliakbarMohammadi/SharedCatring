/**
 * Profile Validation Schemas
 * اسکیماهای اعتبارسنجی پروفایل
 */

import { z } from 'zod';

/**
 * Profile form validation schema
 * اسکیمای اعتبارسنجی فرم پروفایل
 */
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'نام الزامی است')
    .min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z
    .string()
    .min(1, 'نام خانوادگی الزامی است')
    .min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  nationalCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      'کد ملی باید ۱۰ رقم باشد'
    ),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Address form validation schema
 * اسکیمای اعتبارسنجی فرم آدرس
 */
export const addressSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان آدرس الزامی است'),
  address: z
    .string()
    .min(1, 'آدرس الزامی است')
    .min(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد'),
  city: z
    .string()
    .min(1, 'شهر الزامی است'),
  postalCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      'کد پستی باید ۱۰ رقم باشد'
    ),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;
