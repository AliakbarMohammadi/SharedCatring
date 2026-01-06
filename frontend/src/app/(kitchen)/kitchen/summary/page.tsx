"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { formatNumber } from "@/lib/utils";
import apiClient from "@/lib/api-client";

export default function KitchenSummaryPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["kitchen-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/orders/kitchen/summary");
      return res.data.data;
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">خلاصه روز</h1>
        <p className="text-gray-600">تعداد هر غذا برای امروز</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">کل سفارش‌ها</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(summary?.totalOrders || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">در انتظار</p>
            <p className="text-3xl font-bold text-yellow-500">
              {formatNumber(summary?.pendingOrders || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">تکمیل شده</p>
            <p className="text-3xl font-bold text-green-500">
              {formatNumber(summary?.completedOrders || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Food Items Summary */}
      <Card>
        <CardHeader>
          <CardTitle>لیست غذاها</CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.items?.length > 0 ? (
            <div className="space-y-4">
              {summary.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🍽️</span>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.category || "بدون دسته‌بندی"}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-orange-500">
                      {formatNumber(item.quantity)}
                    </p>
                    <p className="text-sm text-gray-500">عدد</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              سفارشی برای امروز ثبت نشده است
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
