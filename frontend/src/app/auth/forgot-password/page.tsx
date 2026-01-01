'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/api/client';

const forgotPasswordSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setSubmittedEmail(data.email);
    forgotPasswordMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success-500" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-800 mb-2">ایمیل ارسال شد</h2>
        <p className="text-secondary-500 mb-6">
          در صورت وجود حساب کاربری با ایمیل{' '}
          <span className="font-medium text-secondary-700">{submittedEmail}</span>
          ، لینک بازیابی رمز عبور برای شما ارسال خواهد شد.
        </p>
        <p className="text-sm text-secondary-500 mb-8">
          ایمیل را دریافت نکردید؟ پوشه اسپم را بررسی کنید یا{' '}
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-primary-600 hover:text-primary-700"
          >
            دوباره تلاش کنید
          </button>
        </p>
        <Link href="/auth/login">
          <Button variant="outline" leftIcon={<ArrowRight className="w-4 h-4" />}>
            بازگشت به صفحه ورود
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:text-secondary-700 mb-6"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به ورود
      </Link>

      <h2 className="text-2xl font-bold text-secondary-800 mb-2">فراموشی رمز عبور</h2>
      <p className="text-secondary-500 mb-8">
        ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود.
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

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={forgotPasswordMutation.isPending}
        >
          ارسال لینک بازیابی
        </Button>
      </form>
    </div>
  );
}
