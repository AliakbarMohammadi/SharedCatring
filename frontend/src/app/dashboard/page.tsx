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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonFoodCard } from '@/components/ui/Skeleton';
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
} from '@/lib/utils/format';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', { limit: 5 }],
    queryFn: () => orderService.getOrders({ limit: 5 }),
  });

  // Fetch today's menu
  const { data: dailyMenu, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', 'daily'],
    queryFn: () => menuService.getDailyMenu(),
  });

  const recentOrders = ordersData?.data || [];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-800 mb-1">
          سلام {user?.firstName} 👋
        </h1>
        <p className="text-secondary-500">
          امروز چه غذایی میل دارید؟
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">موجودی کیف پول</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {formatPrice(wallet?.totalBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>

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
                  {toPersianDigits(
                    recentOrders.filter((o) =>
                      ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
                    ).length
                  )}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">یارانه سازمانی</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {formatPrice(wallet?.companyBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">آخرین سفارش</p>
              {ordersLoading ? (
                <Skeleton variant="text" className="w-20 h-6" />
              ) : recentOrders[0] ? (
                <p className="text-lg font-bold text-secondary-800">
                  {toJalali(recentOrders[0].createdAt, 'jMM/jDD')}
                </p>
              ) : (
                <p className="text-lg font-bold text-secondary-400">-</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Menu */}
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="منوی امروز"
              subtitle={dailyMenu?.title}
              action={
                <Link href="/menu">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                    مشاهده همه
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {menuLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonFoodCard key={i} />
                  ))}
                </div>
              ) : dailyMenu?.items && dailyMenu.items.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {dailyMenu.items.slice(0, 4).map((item) => (
                    <Link
                      key={item.foodId}
                      href={`/menu/${item.foodId}`}
                      className="flex gap-3 p-3 rounded-xl border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all"
                    >
                      <div className="w-20 h-20 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.food.image ? (
                          <img
                            src={item.food.image}
                            alt={item.food.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🍽️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-800 truncate">
                          {item.food.name}
                        </h4>
                        <p className="text-sm text-secondary-500 line-clamp-2 mb-2">
                          {item.food.description}
                        </p>
                        <p className="text-primary-600 font-bold">
                          {formatPrice(item.food.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UtensilsCrossed className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">منوی امروز هنوز منتشر نشده است</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div>
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="سفارشات اخیر"
              action={
                <Link href="/orders">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                    همه
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton variant="rectangular" className="w-10 h-10" />
                      <div className="flex-1">
                        <Skeleton variant="text" className="w-20 h-4 mb-1" />
                        <Skeleton variant="text" className="w-16 h-3" />
                      </div>
                      <Skeleton variant="rectangular" className="w-16 h-6" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-lg">
                        🍱
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-secondary-800 text-sm">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {toJalali(order.createdAt, 'jYYYY/jMM/jDD')}
                        </p>
                      </div>
                      <Badge
                        variant={orderStatusColors[order.status] as any}
                        size="sm"
                      >
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">هنوز سفارشی ثبت نکرده‌اید</p>
                  <Link href="/menu">
                    <Button variant="primary" size="sm" className="mt-4">
                      مشاهده منو
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
