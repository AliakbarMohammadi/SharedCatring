"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatNumber } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import {
  Building2,
  Users,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/reports/dashboard");
      return res.data.data;
    },
  });

  const { data: companyStats } = useQuery({
    queryKey: ["company-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/companies/stats");
      return res.data.data;
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/users/stats");
      return res.data.data;
    },
  });

  const { data: orderStats } = useQuery({
    queryKey: ["order-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/orders/stats");
      return res.data.data;
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">داشبورد مدیریت</h1>
        <p className="text-gray-600">نمای کلی از وضعیت سیستم</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">کل شرکت‌ها</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(companyStats?.total || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4" />
              <span>{companyStats?.newThisMonth || 0} جدید این ماه</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">کل کاربران</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(userStats?.total || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4" />
              <span>{userStats?.activeUsers || 0} کاربر فعال</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">سفارش‌های امروز</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(orderStats?.todayOrders || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <ShoppingBag className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span>{orderStats?.pendingOrders || 0} در انتظار</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">درآمد این ماه</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(dashboard?.monthlyRevenue || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4" />
              <span>+{dashboard?.revenueGrowth || 0}% نسبت به ماه قبل</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>غذاهای پرفروش</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>شرکت‌های فعال</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.topCompanies?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.topCompanies.slice(0, 5).map((company: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-gray-900">{company.name}</span>
                    </div>
                    <span className="text-gray-500">
                      {formatPrice(company.totalSpent)}
                    </span>
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
