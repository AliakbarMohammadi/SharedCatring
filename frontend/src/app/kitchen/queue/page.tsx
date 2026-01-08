'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  ChefHat,
  CheckCircle,
  PlayCircle,
  Package,
  RefreshCw,
  Calendar,
  Building2,
  User,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { kitchenService, KitchenOrder } from '@/services/kitchen.service';
import { formatPrice, toJalali, toPersianDigits, getTodayPersian } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

export default function KitchenQueuePage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Fetch queue with auto-refresh every 30 seconds
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['kitchen', 'queue', selectedDate],
    queryFn: () => kitchenService.getQueue({ date: selectedDate }),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['kitchen', 'stats', selectedDate],
    queryFn: () => kitchenService.getStats(selectedDate),
    refetchInterval: 30000,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: any }) =>
      kitchenService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success('وضعیت سفارش به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['kitchen'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی وضعیت');
    },
  });

  const handleStatusChange = (orderId: string, newStatus: any) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${toPersianDigits(diffMins)} دقیقه`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(mins)} دقیقه`;
  };

  const getTimeColor = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMins = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffMins < 15) return 'text-success-600';
    if (diffMins < 30) return 'text-warning-600';
    return 'text-error-600';
  };

  const pendingOrders = orders?.filter((o) => o.status === 'pending') || [];
  const preparingOrders = orders?.filter((o) => o.status === 'preparing') || [];
  const readyOrders = orders?.filter((o) => o.status === 'ready') || [];

  const OrderCard = ({ order }: { order: KitchenOrder }) => (
    <Card
      variant="elevated"
      padding="md"
      className="mb-3 hover:shadow-lg transition-shadow touch-manipulation"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-secondary-800">
              #{order.orderNumber}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className={cn('w-4 h-4', getTimeColor(order.createdAt))} />
              <span className={cn('text-sm font-medium', getTimeColor(order.createdAt))}>
                {getTimeElapsed(order.createdAt)}
              </span>
            </div>
          </div>
          <Badge
            variant={
              order.status === 'pending'
                ? 'warning'
                : order.status === 'preparing'
                ? 'info'
                : 'success'
            }
            size="lg"
          >
            {order.status === 'pending'
              ? 'در انتظار'
              : order.status === 'preparing'
              ? 'در حال آماده‌سازی'
              : 'آماده'}
          </Badge>
        </div>

        {/* Customer Info */}
        <div className="flex flex-col gap-1 text-sm text-secondary-600">
          {order.userName && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{order.userName}</span>
            </div>
          )}
          {order.companyName && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{order.companyName}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-secondary-50 rounded-lg p-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-sm">
                    {toPersianDigits(item.quantity)}×
                  </span>
                </div>
                <span className="font-medium text-secondary-800">{item.foodName}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-2">
            <p className="text-sm text-warning-800">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => handleStatusChange(order.id, 'preparing')}
              leftIcon={<PlayCircle className="w-5 h-5" />}
              loading={updateStatusMutation.isPending}
            >
              شروع آماده‌سازی
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              variant="success"
              fullWidth
              size="lg"
              onClick={() => handleStatusChange(order.id, 'ready')}
              leftIcon={<CheckCircle className="w-5 h-5" />}
              loading={updateStatusMutation.isPending}
            >
              آماده شد
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              variant="outline"
              fullWidth
              size="lg"
              onClick={() => handleStatusChange(order.id, 'delivered')}
              leftIcon={<Package className="w-5 h-5" />}
              loading={updateStatusMutation.isPending}
            >
              تحویل داده شد
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-secondary-800 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-primary-600" />
            صف آشپزخانه
          </h1>
          <Button
            variant="outline"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            به‌روزرسانی
          </Button>
        </div>
        <p className="text-secondary-500">{getTodayPersian()}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="elevated" padding="md" className="bg-warning-50 border-warning-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-warning-700">
                {toPersianDigits(stats.pending)}
              </p>
              <p className="text-sm text-warning-600 mt-1">در انتظار</p>
            </div>
          </Card>
          <Card variant="elevated" padding="md" className="bg-blue-50 border-blue-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-700">
                {toPersianDigits(stats.preparing)}
              </p>
              <p className="text-sm text-blue-600 mt-1">در حال آماده‌سازی</p>
            </div>
          </Card>
          <Card variant="elevated" padding="md" className="bg-success-50 border-success-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-success-700">
                {toPersianDigits(stats.ready)}
              </p>
              <p className="text-sm text-success-600 mt-1">آماده</p>
            </div>
          </Card>
          <Card variant="elevated" padding="md" className="bg-secondary-100 border-secondary-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary-700">
                {toPersianDigits(stats.totalToday)}
              </p>
              <p className="text-sm text-secondary-600 mt-1">کل امروز</p>
            </div>
          </Card>
        </div>
      )}

      {/* Kanban Board */}
      {isLoading ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton variant="text" className="w-32 h-6 mb-4" />
              <Skeleton variant="rectangular" className="w-full h-64 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-warning-500 rounded-full" />
              <h2 className="text-lg font-bold text-secondary-800">
                در انتظار ({toPersianDigits(pendingOrders.length)})
              </h2>
            </div>
            <div className="space-y-3">
              {pendingOrders.length === 0 ? (
                <Card variant="elevated" padding="lg">
                  <EmptyState
                    icon={<Clock className="w-10 h-10" />}
                    title="سفارشی در انتظار نیست"
                    description=""
                  />
                </Card>
              ) : (
                pendingOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

          {/* Preparing Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <h2 className="text-lg font-bold text-secondary-800">
                در حال آماده‌سازی ({toPersianDigits(preparingOrders.length)})
              </h2>
            </div>
            <div className="space-y-3">
              {preparingOrders.length === 0 ? (
                <Card variant="elevated" padding="lg">
                  <EmptyState
                    icon={<ChefHat className="w-10 h-10" />}
                    title="سفارشی در حال آماده‌سازی نیست"
                    description=""
                  />
                </Card>
              ) : (
                preparingOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-success-500 rounded-full" />
              <h2 className="text-lg font-bold text-secondary-800">
                آماده ({toPersianDigits(readyOrders.length)})
              </h2>
            </div>
            <div className="space-y-3">
              {readyOrders.length === 0 ? (
                <Card variant="elevated" padding="lg">
                  <EmptyState
                    icon={<CheckCircle className="w-10 h-10" />}
                    title="سفارش آماده‌ای وجود ندارد"
                    description=""
                  />
                </Card>
              ) : (
                readyOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
