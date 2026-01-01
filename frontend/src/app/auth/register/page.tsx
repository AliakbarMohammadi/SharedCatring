'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/api/client';

const registerSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید'),
  password: z
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید شامل حروف بزرگ باشد')
    .regex(/[a-z]/, 'رمز عبور باید شامل حروف کوچک باشد')
    .regex(/[0-9]/, 'رمز عبور باید شامل عدد باشد'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'پذیرش قوانین الزامی است',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('ثبت‌نام با موفقیت انجام شد. لطفاً وارد شوید.');
      router.push('/auth/login');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, acceptTerms, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-800 mb-2">ایجاد حساب کاربری</h2>
      <p className="text-secondary-500 mb-8">
        قبلاً ثبت‌نام کرده‌اید؟{' '}
        <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
          وارد شوید
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="نام"
            placeholder="علی"
            leftIcon={<User className="w-5 h-5" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="نام خانوادگی"
            placeholder="محمدی"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="ایمیل"
          type="email"
          placeholder="email@example.com"
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="شماره موبایل"
          type="tel"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          leftIcon={<Phone className="w-5 h-5" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="رمز عبور"
          type={showPassword ? 'text' : 'password'}
          placeholder="حداقل ۸ کاراکتر"
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
          hint="شامل حروف بزرگ، کوچک و عدد"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="تکرار رمز عبور"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="رمز عبور را تکرار کنید"
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-secondary-400 hover:text-secondary-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 mt-1 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
            {...register('acceptTerms')}
          />
          <span className="text-sm text-secondary-600">
            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
              قوانین و مقررات
            </Link>{' '}
            را مطالعه کرده و می‌پذیرم
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-error-500">{errors.acceptTerms.message}</p>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={registerMutation.isPending}
        >
          ثبت‌نام
        </Button>
      </form>
    </div>
  );
}
