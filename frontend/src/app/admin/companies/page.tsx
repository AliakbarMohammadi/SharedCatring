'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Building2, Search, Check, X, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty, TableSkeleton } from '@/components/ui/Table';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { adminService } from '@/services/admin.service';
import { formatPrice, toJalali, toPersianDigits } from '@/lib/utils/format';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'pending', label: 'در انتظار تأیید' },
  { value: 'approved', label: 'تأیید شده' },
  { value: 'rejected', label: 'رد شده' },
];

const statusLabels: Record<string, string> = {
  pending: 'در انتظار',
  approved: 'تأیید شده',
  rejected: 'رد شده',
};

const statusColors: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'companies', { search: searchQuery, status: statusFilter, page }],
    queryFn: () => adminService.getCompanies({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      page,
      limit: 20,
    }),
  });

  const approveMutation = useMutation({
    mutationFn: adminService.approveCompany,
    onSuccess: () => {
      toast.success('شرکت تأیید شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      setApproveId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در تأیید شرکت');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectCompany(id, reason),
    onSuccess: () => {
      toast.success('شرکت رد شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      setRejectModal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در رد شرکت');
    },
  });

  const companies = data?.data || [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout variant="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">مدیریت شرکت‌ها</h1>
          <p className="text-secondary-500">مشاهده و تأیید شرکت‌ها</p>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="md" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="جستجوی شرکت..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              rightIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={(value) => { setStatusFilter(value); setPage(1); }}
              placeholder="فیلتر وضعیت"
              options={statusOptions}
            />
          </div>
        </div>
      </Card>

      {/* Companies Table */}
      <Card variant="elevated" padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام شرکت</TableHead>
              <TableHead>کد</TableHead>
              <TableHead>تعداد کارمندان</TableHead>
              <TableHead>موجودی کیف پول</TableHead>
              <TableHead>تاریخ ثبت</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={10} cols={7} />
            ) : companies.length === 0 ? (
              <TableEmpty
                colSpan={7}
                icon={<Building2 className="w-12 h-12" />}
                title="شرکتی یافت نشد"
              />
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.code}</TableCell>
                  <TableCell>{toPersianDigits(company.employeeCount)}</TableCell>
                  <TableCell>{formatPrice(company.walletBalance)}</TableCell>
                  <TableCell>{toJalali(company.createdAt, 'jYYYY/jMM/jDD')}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[company.status] as any} size="sm">
                      {statusLabels[company.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/companies/${company.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {company.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success-600"
                            onClick={() => setApproveId(company.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error-600"
                            onClick={() => setRejectModal({ id: company.id, reason: '' })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
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

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={!!approveId}
        onClose={() => setApproveId(null)}
        onConfirm={() => approveId && approveMutation.mutate(approveId)}
        title="تأیید شرکت"
        message="آیا از تأیید این شرکت اطمینان دارید؟"
        confirmText="بله، تأیید شود"
        cancelText="انصراف"
        loading={approveMutation.isPending}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="رد شرکت"
      >
        {rejectModal && (
          <div className="space-y-4">
            <Input
              label="دلیل رد"
              placeholder="دلیل رد شرکت را وارد کنید"
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectModal(null)}>
                انصراف
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-error-500 hover:bg-error-600"
                onClick={() => rejectMutation.mutate({ id: rejectModal.id, reason: rejectModal.reason })}
                loading={rejectMutation.isPending}
              >
                رد شرکت
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
