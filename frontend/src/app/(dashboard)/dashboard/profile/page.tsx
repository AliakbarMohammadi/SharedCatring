"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import { toast } from "@/components/ui/toast";
import { User, Lock } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "نام حداقل ۲ کاراکتر باشد"),
  lastName: z.string().min(2, "نام خانوادگی حداقل ۲ کاراکتر باشد"),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "رمز عبور فعلی الزامی است"),
    newPassword: z.string().min(8, "رمز عبور جدید حداقل ۸ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "رمز عبور جدید و تکرار آن یکسان نیست",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const res = await apiClient.put(`/users/${user?.id}`, data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setUser({ ...user!, ...data });
      toast("پروفایل بروزرسانی شد", "success");
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در بروزرسانی", "error");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      return apiClient.patch(`/identity/users/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast("رمز عبور تغییر کرد", "success");
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در تغییر رمز عبور", "error");
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">پروفایل</h1>
        <p className="text-gray-600">مدیریت اطلاعات حساب کاربری</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              اطلاعات شخصی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={profileForm.handleSubmit((data) =>
                updateProfileMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <Input
                label="نام"
                error={profileForm.formState.errors.firstName?.message}
                {...profileForm.register("firstName")}
              />
              <Input
                label="نام خانوادگی"
                error={profileForm.formState.errors.lastName?.message}
                {...profileForm.register("lastName")}
              />
              <Input
                label="ایمیل"
                value={user?.email}
                disabled
                className="bg-gray-50"
              />
              <Input
                label="شماره موبایل"
                error={profileForm.formState.errors.phone?.message}
                {...profileForm.register("phone")}
              />
              <Button
                type="submit"
                isLoading={updateProfileMutation.isPending}
              >
                ذخیره تغییرات
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              تغییر رمز عبور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit((data) =>
                updatePasswordMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <Input
                label="رمز عبور فعلی"
                type="password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register("currentPassword")}
              />
              <Input
                label="رمز عبور جدید"
                type="password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register("newPassword")}
              />
              <Input
                label="تکرار رمز عبور جدید"
                type="password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register("confirmPassword")}
              />
              <Button
                type="submit"
                isLoading={updatePasswordMutation.isPending}
              >
                تغییر رمز عبور
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
