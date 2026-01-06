"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatNumber } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import { Users, Wallet, ShoppingBag, TrendingUp } from "lucide-react";

export default function CompanyDashboardPage() {
  const { user } = useAuthStore();

  const { data: dashboard } = useQuery({
    queryKey: ["company-dashboard", user?.companyId],
    queryFn: async () => {
      const res = await apiClient.get(`/companies/${user?.companyId}/dashboard`);
      return res.data.data;
    },
    enabled: !!user?.companyId,
  });

  const { data: wallet } = useQuery({
    queryKey: ["company-wallet", user?.companyId],
    queryFn: async () => {
      const res = await apiClient.get(`/wallets/company/${user?.companyId}`);
      return res.data.data;
    },
    enabled: !!user?.companyId,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">داشبورد شرکت</h1>
        <p className="text-gray-600">نمای کلی از وضعیت شرکت</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">تعداد کارمندان</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboard?.employeeCount || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">موجودی کیف پول</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(wallet?.balance || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Wallet className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">سفارش‌های این ماه</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboard?.monthlyOrders || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <ShoppingBag className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">هزینه این ماه</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(dashboard?.monthlySpending || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>کارمندان فعال</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.topEmployees?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.topEmployees.slice(0, 5).map((emp: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                        {emp.firstName?.[0]}
                      </div>
                      <span className="text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                    <span className="text-gray-500">{emp.orderCount} سفارش</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">داده‌ای موجود نیست</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>غذاهای پرطرفدار</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.popularItems?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.popularItems.slice(0, 5).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-gray-500">{item.count} سفارش</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">داده‌ای موجود نیست</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
