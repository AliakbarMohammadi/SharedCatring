'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  UtensilsCrossed,
  ShoppingCart,
  ClipboardList,
  Wallet,
  TrendingUp,
  Clock,
  ChevronLeft,
  Plus,
  User,
  History,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonFoodCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/auth.store';
import { walletService } from '@/services/wallet.service';
import { orderService } from '@/services/order.service';
import { menuService } from '@/services/menu.service';
import {
  formatPrice,
  toJalali,
  orderStatusLabels,
  orderStatusColors,
  toPersianDigits,
  getTodayPersian,
  formatRelativeTime,
} from '@/lib/utils/format';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['orders', { limit: 5 }],
    queryFn: () => orderService.getOrders({ limit: 5 }),
  });

  // Fetch today's menu
  const { data: dailyMenu, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', 'daily'],
    queryFn: () => menuService.getDailyMenu(),
  });

  const recentOrders = ordersData?.data || [];
  const activeOrdersCount = recentOrders.filter((o) =>
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  ).length;

  // Calculate total spent this month
  const totalSpentThisMonth = recentOrders
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear() &&
        order.status !== 'cancelled'
      );
    })
    .reduce((total, order) => total + (order.userPayable || order.totalAmount || 0), 0);

  const handleRefresh = () => {
    refetchWallet();
    refetchOrders();
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-1">
            سلام {user?.firstName} 👋
          </h1>
          <p className="text-secondary-500">{getTodayPersian()}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={handleRefresh}
        >
          بروزرسانی
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Wallet Balance */}
        <Card variant="elevated" padding="md" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-secondary-500">موجودی کیف پول</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800 truncate">
                  {formatPrice(wallet?.totalBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
          <Link href="/wallet">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              className="mt-3"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              شارژ کیف پول
            </Button>
          </Link>
        </Card>

        {/* Active Orders */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">سفارشات فعال</p>
              {ordersLoading ? (
                <Skeleton variant="text" className="w-12 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {toPersianDigits(activeOrdersCount)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Company Subsidy */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-secondary-500">یارانه سازمانی</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800 truncate">
                  {formatPrice(wallet?.companyBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Monthly Spent */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-warning-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-secondary-500">هزینه این ماه</p>
              {ordersLoading ? (
                <Skeleton variant="text" className="w-20 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800 truncate">
                  {formatPrice(totalSpentThisMonth, false)}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders - Main Area */}
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="سفارشات اخیر"
              subtitle={`${toPersianDigits(recentOrders.length)} سفارش`}
              action={
                <Link href="/orders">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                    مشاهده همه
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-secondary-50">
                      <Skeleton variant="rectangular" className="w-12 h-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton variant="text" className="w-24 h-4 mb-2" />
                        <Skeleton variant="text" className="w-32 h-3" />
                      </div>
                      <Skeleton variant="rectangular" className="w-20 h-6 rounded-full" />
                      <Skeleton variant="text" className="w-24 h-4" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-secondary-100">
                        <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">
                          تاریخ
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">
                          شماره سفارش
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">
                          وضعیت
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">
                          مبلغ
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-secondary-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="text-sm text-secondary-800">
                              {toJalali(order.createdAt, 'jMM/jDD')}
                            </div>
                            <div className="text-xs text-secondary-500">
                              {formatRelativeTime(order.createdAt)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-sm text-secondary-700">
                              {order.orderNumber?.slice(-8) || order.id.slice(-8)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={orderStatusColors[order.status] as any}
                              size="sm"
                              dot
                            >
                              {orderStatusLabels[order.status] || order.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-secondary-800">
                              {formatPrice(order.userPayable || order.totalAmount)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                جزئیات
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={<ShoppingCart className="w-12 h-12" />}
                  title="هنوز سفارشی ثبت نکرده‌اید"
                  description="اولین سفارش خود را از منوی امروز ثبت کنید"
                  action={
                    <Link href="/menu">
                      <Button variant="primary" leftIcon={<UtensilsCrossed className="w-4 h-4" />}>
                        مشاهده منو
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="elevated" padding="lg">
            <CardHeader title="دسترسی سریع" />
            <CardContent>
              <div className="space-y-3">
                <Link href="/menu" className="block">
                  <Button
                    variant="secondary"
                    fullWidth
                    className="justify-start"
                    leftIcon={<UtensilsCrossed className="w-5 h-5" />}
                  >
                    مشاهده منو
                  </Button>
                </Link>
                <Link href="/orders" className="block">
                  <Button
                    variant="secondary"
                    fullWidth
                    className="justify-start"
                    leftIcon={<History className="w-5 h-5" />}
                  >
                    تاریخچه سفارشات
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button
                    variant="secondary"
                    fullWidth
                    className="justify-start"
                    leftIcon={<User className="w-5 h-5" />}
                  >
                    ویرایش پروفایل
                  </Button>
                </Link>
                <Link href="/wallet" className="block">
                  <Button
                    variant="secondary"
                    fullWidth
                    className="justify-start"
                    leftIcon={<Wallet className="w-5 h-5" />}
                  >
                    کیف پول
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Today's Menu Preview */}
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="منوی امروز"
              action={
                <Link href="/menu">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                    همه
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {menuLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton variant="rectangular" className="w-16 h-16 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton variant="text" className="w-full h-4 mb-2" />
                        <Skeleton variant="text" className="w-20 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : dailyMenu?.items && dailyMenu.items.length > 0 ? (
                <div className="space-y-3">
                  {dailyMenu.items.slice(0, 3).map((item) => (
                    <Link
                      key={item.foodId}
                      href={`/menu/${item.foodId}`}
                      className="flex gap-3 p-2 rounded-xl hover:bg-secondary-50 transition-colors"
                    >
                      <div className="w-14 h-14 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.food?.image ? (
                          <img
                            src={item.food.image}
                            alt={item.food.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🍽️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-800 text-sm truncate">
                          {item.food?.name}
                        </h4>
                        <p className="text-primary-600 font-bold text-sm">
                          {formatPrice(item.food?.price || 0)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <UtensilsCrossed className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
                  <p className="text-sm text-secondary-500">منوی امروز هنوز منتشر نشده</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
