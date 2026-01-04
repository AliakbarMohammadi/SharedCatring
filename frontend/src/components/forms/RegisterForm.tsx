'use client';

/**
 * Register Form Component
 * کامپوننت فرم ثبت‌نام
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, Lock, Phone, User, Building } from 'lucide-react';
import toast from 'react-hot-toast';

import { registerSchema, RegisterFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'personal_user',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register({
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      toast.success('ثبت‌نام با موفقیت انجام شد');
      router.push('/auth/login');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'خطا در ثبت‌نام';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نوع کاربری
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedRole === 'personal_user'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              value="personal_user"
              {...register('role')}
              className="sr-only"
            />
            <User className="h-5 w-5 ml-2" />
            <span className="text-sm font-medium">کاربر شخصی</span>
          </label>
          <label
            className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedRole === 'company_admin'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              value="company_admin"
              {...register('role')}
              className="sr-only"
            />
            <Building className="h-5 w-5 ml-2" />
            <span className="text-sm font-medium">مدیر شرکت</span>
          </label>
        </div>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          ایمیل
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`block w-full pr-10 pl-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="example@email.com"
            dir="ltr"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          شماره موبایل
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register('phone')}
            className={`block w-full pr-10 pl-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="09123456789"
            dir="ltr"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          رمز عبور
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password')}
            className={`block w-full pr-10 pl-10 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="حداقل ۸ کاراکتر"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 left-0 pl-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          تکرار رمز عبور
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={`block w-full pr-10 pl-10 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="تکرار رمز عبور"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 left-0 pl-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 ml-2" />
            در حال ثبت‌نام...
          </>
        ) : (
          'ثبت‌نام'
        )}
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600">
        قبلاً ثبت‌نام کرده‌اید؟{' '}
        <Link
          href="/auth/login"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          وارد شوید
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
