'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ClipboardList, ChevronLeft, Filter, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { orderService } from '@/services/order.service';
import { formatPrice, toJalali, orderStatusLabels, orderStatusColors, toPersianDigits } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const statusFilters = [
  { value: '', label: 'همه' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'confirmed', label: 'تأیید شده' },
  { value: 'preparing', label: 'در حال آماده‌سازی' },
  { value: 'ready', label: 'آماده تحویل' },
  { value: 'delivered', label: 'تحویل شده' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'cancelled', label: 'لغو شده' },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { status: statusFilter, page }],
    queryFn: () => orderService.getOrders({ status: statusFilter || undefined, page, limit: 10 }),
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">سفارشات من</h1>
        <p className="text-secondary-500">تاریخچه و وضعیت سفارشات شما</p>
      </div>

      {/* Filters */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="md">
              <div className="flex items-center gap-4">
                <Skeleton variant="rectangular" className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-32 h-5 mb-2" />
                  <Skeleton variant="text" className="w-24 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-20 h-8 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-16 h-16" />}
          title="سفارشی یافت نشد"
          description={statusFilter ? 'سفارشی با این وضعیت وجود ندارد' : 'هنوز سفارشی ثبت نکرده‌اید'}
          action={
            statusFilter ? (
              <Button variant="primary" onClick={() => setStatusFilter('')}>
                نمایش همه سفارشات
              </Button>
            ) : (
              <Link href="/menu">
                <Button variant="primary">مشاهده منو</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card variant="elevated" padding="md" className="hover:border-primary-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center text-3xl">
                    🍱
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-secondary-800">{order.orderNumber}</h3>
                      <Badge
                        variant={orderStatusColors[order.status] as any}
                        size="sm"
                      >
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary-500">
                      {toJalali(order.createdAt, 'jYYYY/jMM/jDD - HH:mm')}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {toPersianDigits(order.items?.length || 0)} آیتم
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</p>
                    <ChevronLeft className="w-5 h-5 text-secondary-400 mt-2 mr-auto" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                قبلی
              </Button>
              <span className="text-secondary-600">
                صفحه {toPersianDigits(page)} از {toPersianDigits(pagination.totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                بعدی
              </Button>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
