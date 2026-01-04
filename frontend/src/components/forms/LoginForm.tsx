'use client';

/**
 * Login Form Component
 * کامپوننت فرم ورود
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { loginSchema, LoginFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';
import { useAuthStore, getRedirectPath } from '@/stores/auth.store';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      // 1. Store tokens and user data
      login(response.user, response.accessToken, response.refreshToken);
      
      // 2. Show success message
      toast.success(`خوش آمدید ${response.user.firstName || ''}!`);
      
      // 3. Handle redirect
      if (onSuccess) {
        onSuccess();
      } else {
        const redirectPath = getRedirectPath(response.user.role);
        
        // Use setTimeout to ensure state is saved before redirect
        setTimeout(() => {
          router.replace(redirectPath);
          
          // Fallback: if router doesn't work, use window.location
          setTimeout(() => {
            if (window.location.pathname.includes('/auth/login')) {
              window.location.href = redirectPath;
            }
          }, 500);
        }, 100);
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'خطا در ورود به سیستم';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            autoComplete="current-password"
            {...register('password')}
            className={`block w-full pr-10 pl-10 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
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

      {/* Forgot Password Link */}
      <div className="flex items-center justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          فراموشی رمز عبور؟
        </Link>
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
            در حال ورود...
          </>
        ) : (
          'ورود'
        )}
      </button>

      {/* Register Link */}
      <p className="text-center text-sm text-gray-600">
        حساب کاربری ندارید؟{' '}
        <Link
          href="/auth/register"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          ثبت‌نام کنید
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
