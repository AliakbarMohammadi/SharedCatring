"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import apiClient from "@/lib/api-client";
import { Company } from "@/types";
import { toast } from "@/components/ui/toast";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(2, "نام شرکت الزامی است"),
  nationalId: z.string().min(10, "شناسه ملی معتبر نیست"),
  economicCode: z.string().optional(),
  phone: z.string().optional(),
  adminUserId: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await apiClient.get("/companies");
      return res.data.data as Company[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CompanyForm) => {
      if (editingCompany) {
        return apiClient.put(`/companies/${editingCompany.id}`, data);
      }
      return apiClient.post("/companies", data);
    },
    onSuccess: () => {
      toast(editingCompany ? "شرکت ویرایش شد" : "شرکت ایجاد شد", "success");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setShowModal(false);
      setEditingCompany(null);
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در عملیات", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/companies/${id}`);
    },
    onSuccess: () => {
      toast("شرکت حذف شد", "success");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در حذف", "error");
    },
  });

  const filteredCompanies = companies?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setShowModal(true);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت شرکت‌ها</h1>
          <p className="text-gray-600">لیست تمام شرکت‌های ثبت شده</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="ml-2 h-4 w-4" />
          شرکت جدید
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="جستجوی شرکت..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    نام شرکت
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    شناسه ملی
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    تلفن
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCompanies?.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {company.nationalId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {company.phone || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          company.status === "active" ? "success" : "secondary"
                        }
                      >
                        {company.status === "active" ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(company.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <CompanyModal
          company={editingCompany}
          onClose={() => {
            setShowModal(false);
            setEditingCompany(null);
          }}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}

function CompanyModal({
  company,
  onClose,
  onSubmit,
  isLoading,
}: {
  company: Company | null;
  onClose: () => void;
  onSubmit: (data: CompanyForm) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: company
      ? {
          name: company.name,
          nationalId: company.nationalId,
          economicCode: company.economicCode,
          phone: company.phone,
        }
      : {},
  });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {company ? "ویرایش شرکت" : "شرکت جدید"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="نام شرکت"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="شناسه ملی"
            error={errors.nationalId?.message}
            {...register("nationalId")}
          />
          <Input
            label="کد اقتصادی"
            error={errors.economicCode?.message}
            {...register("economicCode")}
          />
          <Input
            label="تلفن"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              {company ? "ویرایش" : "ایجاد"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
