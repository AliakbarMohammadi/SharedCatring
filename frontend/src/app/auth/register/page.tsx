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

const registerSchema = z.object({
  firstName: z.string().min(2, "نام حداقل ۲ کاراکتر باشد"),
  lastName: z.string().min(2, "نام خانوادگی حداقل ۲ کاراکتر باشد"),
  email: z.string().email("ایمیل معتبر وارد کنید"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر وارد کنید"),
  password: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر باشد"),
  role: z.enum(["personal_user", "company_admin"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "personal_user",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast("ثبت‌نام موفقیت‌آمیز بود", "success");
      router.push("/dashboard");
    } catch (error: any) {
      toast(error.response?.data?.message || "خطا در ثبت‌نام", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">ثبت‌نام</h1>
      <p className="mb-8 text-gray-600">
        حساب کاربری دارید؟{" "}
        <Link href="/auth/login" className="text-orange-500 hover:underline">
          وارد شوید
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="نام"
            placeholder="محمد"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="نام خانوادگی"
            placeholder="محمدی"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Input
          label="ایمیل"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="شماره موبایل"
          type="tel"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="رمز عبور"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            نوع حساب
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 p-3 hover:border-orange-500">
              <input
                type="radio"
                value="personal_user"
                {...register("role")}
                className="text-orange-500"
              />
              <span className="text-sm">کاربر شخصی</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 p-3 hover:border-orange-500">
              <input
                type="radio"
                value="company_admin"
                {...register("role")}
                className="text-orange-500"
              />
              <span className="text-sm">مدیر شرکت</span>
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          ثبت‌نام
        </Button>

        <p className="text-center text-xs text-gray-500">
          با ثبت‌نام، شرایط استفاده و حریم خصوصی را می‌پذیرید.
        </p>
      </form>
    </div>
  );
}
