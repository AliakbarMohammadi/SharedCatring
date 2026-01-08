'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Check, X, Clock, Mail, Phone } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/auth.store';
import { companyService, JoinRequest } from '@/services/company.service';
import { toPersianDigits, toJalali, formatRelativeTime } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

export default function JoinRequestsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const companyId = user?.companyId;

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [page, setPage] = useState(1);

  // Fetch join requests
  const { data, isLoading } = useQuery({
    queryKey: ['company', companyId, 'join-requests', { status: statusFilter, page }],
    queryFn: () =>
      companyService.getJoinRequests(companyId!, {
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    enabled: !!companyId,
  });

  const requests = data?.data || [];
  const pagination = data?.pagination;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: 'approved' | 'rejected' }) =>
      companyService.updateJoinRequestStatus(companyId!, requestId, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'approved'
          ? 'درخواست تأیید شد'
          : 'درخواست رد شد'
      );
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'employees'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در پردازش درخواست');
    },
  });

  const handleApprove = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'approved' });
  };

  const handleReject = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'rejected' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" size="sm">در انتظار</Badge>;
      case 'approved':
        return <Badge variant="success" size="sm">تأیید شده</Badge>;
      case 'rejected':
        return <Badge variant="error" size="sm">رد شده</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">درخواست‌های عضویت</h1>
        <p className="text-secondary-500">
          {pagination ? `${toPersianDigits(pagination.total)} درخواست` : 'مدیریت درخواست‌های عضویت'}
        </p>
      </div>

      {/* Status Filters */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {[
            { value: 'pending' as const, label: 'در انتظار' },
            { value: 'approved' as const, label: 'تأیید شده' },
            { value: 'rejected' as const, label: 'رد شده' },
            { value: 'all' as const, label: 'همه' },
          ].map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="md">
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="w-16 h-16" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-48 h-6 mb-2" />
                  <Skeleton variant="text" className="w-32 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-24 h-10 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="w-16 h-16" />}
          title={statusFilter === 'pending' ? 'درخواستی در انتظار نیست' : 'درخواستی یافت نشد'}
          description={
            statusFilter === 'pending'
              ? 'درخواست‌های جدید در اینجا نمایش داده می‌شوند'
              : 'فیلتر دیگری را امتحان کنید'
          }
          action={
            statusFilter !== 'pending' && (
              <Button variant="primary" onClick={() => setStatusFilter('pending')}>
                نمایش درخواست‌های در انتظار
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} variant="elevated" padding="lg">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* User Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold text-xl">
                        {request.user.firstName?.[0] || request.user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-secondary-800">
                          {request.user.firstName && request.user.lastName
                            ? `${request.user.firstName} ${request.user.lastName}`
                            : 'بدون نام'}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-secondary-600">
                          <Mail className="w-4 h-4" />
                          <span>{request.user.email}</span>
                        </div>
                        {request.user.phone && (
                          <div className="flex items-center gap-2 text-sm text-secondary-600">
                            <Phone className="w-4 h-4" />
                            <span>{request.user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-secondary-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatRelativeTime(request.createdAt)}</span>
                        </div>
                      </div>
                      {request.message && (
                        <div className="mt-3 p-3 bg-secondary-50 rounded-lg">
                          <p className="text-sm text-secondary-700">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex sm:flex-col gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        loading={updateStatusMutation.isPending}
                        leftIcon={<Check className="w-4 h-4" />}
                        className="flex-1 sm:flex-none"
                      >
                        تأیید
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(request.id)}
                        loading={updateStatusMutation.isPending}
                        leftIcon={<X className="w-4 h-4" />}
                        className="flex-1 sm:flex-none text-error-500 border-error-200 hover:bg-error-50"
                      >
                        رد
                      </Button>
                    </div>
                  )}

                  {/* Processed Info */}
                  {request.status !== 'pending' && request.processedAt && (
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-secondary-500">
                        {request.status === 'approved' ? 'تأیید شده در' : 'رد شده در'}
                      </p>
                      <p className="text-sm text-secondary-700">
                        {toJalali(request.processedAt, 'jYYYY/jMM/jDD')}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-secondary-600">
                صفحه {toPersianDigits(page)} از {toPersianDigits(pagination.totalPages)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  قبلی
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  بعدی
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
