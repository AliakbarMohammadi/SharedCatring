"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import { Employee } from "@/types";
import { toast } from "@/components/ui/toast";
import { Plus, Search, Upload, Download, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const employeeSchema = z.object({
  userId: z.string().min(1, "کاربر را انتخاب کنید"),
  employeeCode: z.string().min(1, "کد کارمندی الزامی است"),
  departmentId: z.string().optional(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

export default function EmployeesPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ["company-employees", user?.companyId],
    queryFn: async () => {
      const res = await apiClient.get(`/companies/${user?.companyId}/employees`);
      return res.data.data as Employee[];
    },
    enabled: !!user?.companyId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: EmployeeForm) => {
      return apiClient.post(`/companies/${user?.companyId}/employees`, data);
    },
    onSuccess: () => {
      toast("کارمند اضافه شد", "success");
      queryClient.invalidateQueries({ queryKey: ["company-employees"] });
      setShowModal(false);
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در افزودن کارمند", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return apiClient.delete(
        `/companies/${user?.companyId}/employees/${employeeId}`
      );
    },
    onSuccess: () => {
      toast("کارمند حذف شد", "success");
      queryClient.invalidateQueries({ queryKey: ["company-employees"] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در حذف", "error");
    },
  });

  const handleExport = async () => {
    try {
      const res = await apiClient.get(
        `/companies/${user?.companyId}/employees/export`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employees.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast("خطا در دانلود فایل", "error");
    }
  };

  const filteredEmployees = employees?.filter(
    (e) =>
      e.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employeeCode.includes(searchQuery)
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت کارمندان</h1>
          <p className="text-gray-600">لیست کارمندان شرکت</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="ml-2 h-4 w-4" />
            خروجی اکسل
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="ml-2 h-4 w-4" />
            کارمند جدید
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="جستجوی کارمند..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Employees Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    نام
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    کد کارمندی
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    ایمیل
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    سمت
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees?.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {emp.user?.firstName} {emp.user?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {emp.employeeCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {emp.user?.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {emp.position || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => deleteMutation.mutate(emp.id)}
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      {showModal && (
        <AddEmployeeModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => addMutation.mutate(data)}
          isLoading={addMutation.isPending}
        />
      )}
    </div>
  );
}

function AddEmployeeModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (data: EmployeeForm) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">افزودن کارمند</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="شناسه کاربر"
            placeholder="شناسه کاربر را وارد کنید"
            error={errors.userId?.message}
            {...register("userId")}
          />
          <Input
            label="کد کارمندی"
            placeholder="EMP001"
            error={errors.employeeCode?.message}
            {...register("employeeCode")}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              افزودن
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
