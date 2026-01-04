'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, UserCheck, UserX, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty, TableSkeleton } from '@/components/ui/Table';
import { ConfirmModal } from '@/components/ui/Modal';
import { adminService } from '@/services/admin.service';
import { toJalali, userRoleLabels, formatPhone, toPersianDigits } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import Link from 'next/link';

const roleOptions = [
  { value: 'all', label: 'همه نقش‌ها' },
  { value: 'personal_user', label: 'کاربر شخصی' },
  { value: 'corporate_user', label: 'کاربر سازمانی' },
  { value: 'company_admin', label: 'مدیر شرکت' },
  { value: 'admin', label: 'مدیر سیستم' },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [toggleUserId, setToggleUserId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search: searchQuery, role: roleFilter, page }],
    queryFn: () => adminService.getUsers({
      search: searchQuery || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      page,
      limit: 20,
    }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: adminService.toggleUserStatus,
    onSuccess: () => {
      toast.success('وضعیت کاربر تغییر کرد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setToggleUserId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در تغییر وضعیت');
    },
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout variant="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">مدیریت کاربران</h1>
          <p className="text-secondary-500">مشاهده و مدیریت کاربران سیستم</p>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="md" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="جستجوی کاربر..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              rightIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={roleFilter}
              onValueChange={(value) => { setRoleFilter(value); setPage(1); }}
              placeholder="فیلتر نقش"
              options={roleOptions}
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card variant="elevated" padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>شماره موبایل</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>شرکت</TableHead>
              <TableHead>تاریخ عضویت</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={10} cols={7} />
            ) : users.length === 0 ? (
              <TableEmpty
                colSpan={7}
                icon={<Users className="w-12 h-12" />}
                title="کاربری یافت نشد"
              />
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{formatPhone(user.phone)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" size="sm">
                      {userRoleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.companyName || '-'}</TableCell>
                  <TableCell>{toJalali(user.createdAt, 'jYYYY/jMM/jDD')}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'error'} size="sm">
                      {user.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setToggleUserId(user.id)}
                        className={user.isActive ? 'text-error-600' : 'text-success-600'}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
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

      {/* Toggle Status Modal */}
      <ConfirmModal
        isOpen={!!toggleUserId}
        onClose={() => setToggleUserId(null)}
        onConfirm={() => toggleUserId && toggleStatusMutation.mutate(toggleUserId)}
        title="تغییر وضعیت کاربر"
        message="آیا از تغییر وضعیت این کاربر اطمینان دارید؟"
        confirmText="بله، تغییر دهید"
        cancelText="انصراف"
        loading={toggleStatusMutation.isPending}
      />
    </DashboardLayout>
  );
}
