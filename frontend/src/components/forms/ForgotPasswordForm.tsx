'use client';

/**
 * Forgot Password Form Component
 * کامپوننت فرم فراموشی رمز عبور
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data);
      setIsSuccess(true);
      toast.success('لینک بازیابی رمز عبور ارسال شد');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'خطا در ارسال لینک بازیابی';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">ایمیل ارسال شد</h3>
        <p className="text-sm text-gray-600">
          لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          <ArrowRight className="h-4 w-4 ml-1" />
          بازگشت به صفحه ورود
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود.
        </p>
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 ml-2" />
            در حال ارسال...
          </>
        ) : (
          'ارسال لینک بازیابی'
        )}
      </button>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          <ArrowRight className="h-4 w-4 ml-1" />
          بازگشت به صفحه ورود
        </Link>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;
