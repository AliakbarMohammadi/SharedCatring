"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import { Order, Wallet } from "@/types";
import {
  ShoppingBag,
  Wallet as WalletIcon,
  Clock,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: wallet } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const res = await apiClient.get("/wallets/balance");
      return res.data.data as Wallet;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/orders", { params: { limit: 5 } });
      return res.data.data as Order[];
    },
  });

  const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
    pending: { label: "در انتظار", variant: "warning" },
    confirmed: { label: "تایید شده", variant: "default" },
    preparing: { label: "در حال آماده‌سازی", variant: "default" },
    ready: { label: "آماده تحویل", variant: "success" },
    delivered: { label: "تحویل داده شده", variant: "success" },
    cancelled: { label: "لغو شده", variant: "destructive" },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          سلام، {user?.firstName} 👋
        </h1>
        <p className="text-gray-600">به پنل کاربری خوش آمدید</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <WalletIcon className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">موجودی کیف پول</p>
              <p className="text-xl font-bold text-gray-900">
                {wallet ? formatPrice(wallet.balance) : "---"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">یارانه</p>
              <p className="text-xl font-bold text-gray-900">
                {wallet ? formatPrice(wallet.subsidyBalance) : "---"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <ShoppingBag className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">سفارش‌های فعال</p>
              <p className="text-xl font-bold text-gray-900">
                {recentOrders?.filter((o) =>
                  ["pending", "confirmed", "preparing"].includes(o.status)
                ).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">کل سفارش‌ها</p>
              <p className="text-xl font-bold text-gray-900">
                {recentOrders?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/menu">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="text-4xl">🍽️</span>
              <div>
                <h3 className="font-semibold text-gray-900">سفارش غذا</h3>
                <p className="text-sm text-gray-500">مشاهده منو و سفارش</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reservations">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="text-4xl">📅</span>
              <div>
                <h3 className="font-semibold text-gray-900">رزرو هفتگی</h3>
                <p className="text-sm text-gray-500">رزرو غذای هفته آینده</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/wallet">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="text-4xl">💳</span>
              <div>
                <h3 className="font-semibold text-gray-900">شارژ کیف پول</h3>
                <p className="text-sm text-gray-500">افزایش موجودی</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>سفارش‌های اخیر</CardTitle>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm">
              مشاهده همه
              <ArrowLeft className="mr-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              سفارشی ثبت نشده است
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      سفارش #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} آیتم • {formatPrice(order.total)}
                    </p>
                  </div>
                  <Badge variant={statusLabels[order.status]?.variant}>
                    {statusLabels[order.status]?.label}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
