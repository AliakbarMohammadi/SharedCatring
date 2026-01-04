'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore, getRedirectPath } from '@/stores/auth.store';
import { getErrorMessage } from '@/lib/api/client';

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.role);
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // 1. Store tokens and user data
      login(data.user, data.accessToken, data.refreshToken);
      
      // 2. Show success message
      toast.success(`خوش آمدید ${data.user.firstName || ''}!`);
      
      // 3. Redirect based on role with a small delay to ensure state is persisted
      const redirectPath = getRedirectPath(data.user.role);
      
      // Use setTimeout to ensure state is saved before redirect
      setTimeout(() => {
        // Try router.replace first (prevents back button to login)
        router.replace(redirectPath);
        
        // Fallback: if router doesn't work, use window.location
        setTimeout(() => {
          if (window.location.pathname.includes('/auth/login')) {
            window.location.href = redirectPath;
          }
        }, 500);
      }, 100);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-800 mb-2">ورود به حساب کاربری</h2>
      <p className="text-secondary-500 mb-8">
        حساب کاربری ندارید؟{' '}
        <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
          ثبت‌نام کنید
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="ایمیل"
          type="email"
          placeholder="email@example.com"
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="رمز عبور"
          type={showPassword ? 'text' : 'password'}
          placeholder="رمز عبور خود را وارد کنید"
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-secondary-400 hover:text-secondary-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-600">مرا به خاطر بسپار</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            فراموشی رمز عبور
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={loginMutation.isPending}
        >
          ورود
        </Button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-8 p-4 bg-secondary-50 rounded-xl">
        <p className="text-sm text-secondary-600 mb-2">برای تست:</p>
        <div className="text-sm text-secondary-700 space-y-1">
          <p>ایمیل: <code className="bg-secondary-100 px-1 rounded">ali.mohammadi@example.com</code></p>
          <p>رمز عبور: <code className="bg-secondary-100 px-1 rounded">Ali@123456</code></p>
        </div>
      </div>
    </div>
  );
}
