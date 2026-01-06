"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/components/ui/toast";

const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast("ورود موفقیت‌آمیز بود", "success");
      router.push("/dashboard");
    } catch (error: any) {
      toast(error.response?.data?.message || "خطا در ورود", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">ورود به حساب</h1>
      <p className="mb-8 text-gray-600">
        حساب کاربری ندارید؟{" "}
        <Link href="/auth/register" className="text-orange-500 hover:underline">
          ثبت‌نام کنید
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="ایمیل"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="رمز عبور"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-gray-300" />
            مرا به خاطر بسپار
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-orange-500 hover:underline"
          >
            فراموشی رمز عبور
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          ورود
        </Button>
      </form>
    </div>
  );
}
