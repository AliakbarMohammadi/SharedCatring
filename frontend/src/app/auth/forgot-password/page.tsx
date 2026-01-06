"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import apiClient from "@/lib/api-client";
import { ArrowRight, CheckCircle } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", data);
      setIsSubmitted(true);
    } catch (error: any) {
      toast(error.response?.data?.message || "خطا در ارسال ایمیل", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">ایمیل ارسال شد</h1>
        <p className="mb-8 text-gray-600">
          لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را
          بررسی کنید.
        </p>
        <Link href="/auth/login">
          <Button variant="outline">
            <ArrowRight className="ml-2 h-4 w-4" />
            بازگشت به ورود
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">فراموشی رمز عبور</h1>
      <p className="mb-8 text-gray-600">
        ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="ایمیل"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          ارسال لینک بازیابی
        </Button>

        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به ورود
        </Link>
      </form>
    </div>
  );
}
