'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ClipboardList, Search, Filter, Eye, Check, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty, TableSkeleton } from '@/components/ui/Table';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { adminService } from '@/services/admin.service';
import { formatPrice, toJalali, orderStatusLabels, orderStatusColors, toPersianDigits } from '@/lib/utils/format';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'confirmed', label: 'تأیید شده' },
  { value: 'preparing', label: 'در حال آماده‌سازی' },
  { value: 'ready', label: 'آماده تحویل' },
  { value: 'delivered', label: 'تحویل شده' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'cancelled', label: 'لغو شده' },
];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusModal, setStatusModal] = useState<{ order: any; newStatus: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { status: statusFilter, page }],
    queryFn: () => adminService.getOrders({ status: statusFilter === 'all' ? undefined : statusFilter, page, limit: 20 }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      adminService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success('وضعیت سفارش به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setStatusModal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی وضعیت');
    },
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout variant="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">مدیریت سفارشات</h1>
          <p className="text-secondary-500">مشاهده و مدیریت همه سفارشات</p>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="md" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              value={statusFilter}
              onValueChange={(value) => { setStatusFilter(value); setPage(1); }}
              placeholder="فیلتر وضعیت"
              options={statusOptions}
            />
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card variant="elevated" padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره سفارش</TableHead>
              <TableHead>کاربر</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>مبلغ</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={10} cols={6} />
            ) : orders.length === 0 ? (
              <TableEmpty
                colSpan={6}
                icon={<ClipboardList className="w-12 h-12" />}
                title="سفارشی یافت نشد"
              />
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    {order.user?.firstName} {order.user?.lastName}
                  </TableCell>
                  <TableCell>{toJalali(order.createdAt, 'jYYYY/jMM/jDD')}</TableCell>
                  <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={orderStatusColors[order.status] as any} size="sm">
                      {orderStatusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {order.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success-600"
                            onClick={() => setStatusModal({ order, newStatus: 'confirmed' })}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error-600"
                            onClick={() => setStatusModal({ order, newStatus: 'cancelled' })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStatusModal({ order, newStatus: 'preparing' })}
                        >
                          آماده‌سازی
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStatusModal({ order, newStatus: 'ready' })}
                        >
                          آماده
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStatusModal({ order, newStatus: 'delivered' })}
                        >
                          تحویل
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-secondary-100">
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
      </Card>

      {/* Status Update Modal */}
      <ConfirmModal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        onConfirm={() => statusModal && updateStatusMutation.mutate({
          orderId: statusModal.order.id,
          status: statusModal.newStatus,
        })}
        title="تغییر وضعیت سفارش"
        message={`آیا از تغییر وضعیت سفارش ${statusModal?.order?.orderNumber} به "${orderStatusLabels[statusModal?.newStatus || '']}" اطمینان دارید؟`}
        confirmText="بله، تغییر دهید"
        cancelText="انصراف"
        loading={updateStatusMutation.isPending}
      />
    </DashboardLayout>
  );
}
