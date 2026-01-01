'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Clock, Phone, Check, X, RefreshCw, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/Modal';
import { orderService } from '@/services/order.service';
import { formatPrice, toJalali, orderStatusLabels, orderStatusColors, toPersianDigits } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import toast from 'react-hot-toast';

const statusSteps = [
  { status: 'pending', label: 'ثبت سفارش', icon: FileText },
  { status: 'confirmed', label: 'تأیید سفارش', icon: Check },
  { status: 'preparing', label: 'آماده‌سازی', icon: RefreshCw },
  { status: 'ready', label: 'آماده تحویل', icon: Clock },
  { status: 'delivered', label: 'تحویل داده شده', icon: Check },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(orderId),
    onSuccess: () => {
      toast.success('سفارش با موفقیت لغو شد');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      setShowCancelModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در لغو سفارش');
    },
  });

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled' || status === 'rejected') return -1;
    return statusSteps.findIndex((s) => s.status === status);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Skeleton variant="text" className="w-32 h-8 mb-6" />
          <Skeleton variant="rectangular" className="w-full h-32 rounded-xl mb-6" />
          <Skeleton variant="rectangular" className="w-full h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-secondary-500 mb-4">سفارش مورد نظر یافت نشد</p>
          <Button variant="primary" onClick={() => router.push('/orders')}>
            بازگشت به سفارشات
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          بازگشت
        </Button>

        {/* Order Header */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-secondary-800 mb-1">
                سفارش {order.orderNumber}
              </h1>
              <p className="text-sm text-secondary-500">
                {toJalali(order.createdAt, 'jYYYY/jMM/jDD - HH:mm')}
              </p>
            </div>
            <Badge
              variant={orderStatusColors[order.status] as any}
              size="md"
            >
              {orderStatusLabels[order.status]}
            </Badge>
          </div>

          {/* Status Timeline */}
          {order.status !== 'cancelled' && order.status !== 'rejected' && (
            <div className="relative">
              <div className="flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10',
                        isCompleted ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-400',
                        isCurrent && 'ring-4 ring-primary-100'
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={cn(
                        'text-xs mt-2 text-center',
                        isCompleted ? 'text-primary-600 font-medium' : 'text-secondary-400'
                      )}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-5 right-0 left-0 h-0.5 bg-secondary-100 -z-0">
                <div
                  className="h-full bg-primary-500 transition-all"
                  style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Cancelled/Rejected Status */}
          {(order.status === 'cancelled' || order.status === 'rejected') && (
            <div className="flex items-center gap-3 p-4 bg-error-50 rounded-xl">
              <X className="w-6 h-6 text-error-500" />
              <div>
                <p className="font-medium text-error-700">
                  {order.status === 'cancelled' ? 'سفارش لغو شده' : 'سفارش رد شده'}
                </p>
                {order.cancelReason && (
                  <p className="text-sm text-error-600">{order.cancelReason}</p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Delivery Info */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <CardHeader title="اطلاعات تحویل" />
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">آدرس تحویل</p>
                <p className="text-secondary-800">{order.deliveryAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">زمان تحویل</p>
                <p className="text-secondary-800">
                  {toJalali(order.deliveryDate, 'jYYYY/jMM/jDD')} - {order.deliveryTimeSlot}
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary-500 mb-1">توضیحات</p>
                <p className="text-secondary-700">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <CardHeader title="آیتم‌های سفارش" />
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-secondary-100 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.food?.image ? (
                      <img src={item.food.image} alt={item.food.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-secondary-800">{item.food?.name || item.foodName}</h4>
                    <p className="text-sm text-secondary-500">
                      {toPersianDigits(item.quantity)} × {formatPrice(item.unitPrice, false)}
                    </p>
                  </div>
                  <p className="font-bold text-secondary-800">
                    {formatPrice(item.quantity * item.unitPrice)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-secondary-200 space-y-2">
              <div className="flex justify-between text-secondary-600">
                <span>جمع کل</span>
                <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
              </div>
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>تخفیف</span>
                  <span>- {formatPrice(order.discount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-secondary-800 pt-2 border-t border-secondary-100">
                <span>مبلغ پرداختی</span>
                <span className="text-primary-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {canCancel && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCancelModal(true)}
              className="text-error-500 border-error-200 hover:bg-error-50"
            >
              لغو سفارش
            </Button>
          </div>
        )}

        {/* Cancel Modal */}
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => cancelMutation.mutate()}
          title="لغو سفارش"
          message="آیا از لغو این سفارش اطمینان دارید؟ این عمل قابل بازگشت نیست."
          confirmText="بله، لغو شود"
          cancelText="انصراف"
          variant="danger"
          loading={cancelMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
