'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, UserCheck, UserX, Eye, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty, TableSkeleton } from '@/components/ui/Table';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { adminService, SystemRole } from '@/services/admin.service';
import { toJalali, userRoleLabels, formatPhone, toPersianDigits } from '@/lib/utils/format';
import { useAuthStore } from '@/stores/auth.store';
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
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [toggleUserId, setToggleUserId] = useState<string | null>(null);
  
  // Role assignment state
  const [roleModalUser, setRoleModalUser] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search: searchQuery, role: roleFilter, page }],
    queryFn: () => adminService.getUsers({
      search: searchQuery || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      page,
      limit: 20,
    }),
  });

  // Fetch system roles (only for super_admin)
  const { data: systemRoles, isError: rolesError } = useQuery({
    queryKey: ['admin', 'systemRoles'],
    queryFn: () => adminService.getSystemRoles(),
    enabled: isSuperAdmin,
    retry: false, // Don't retry on 403
  });

  // Fallback roles if API fails (without IDs - will use role name for assignment)
  const fallbackRoles: SystemRole[] = [
    { id: '', value: 'super_admin', label: 'مدیر کل' },
    { id: '', value: 'company_admin', label: 'مدیر شرکت' },
    { id: '', value: 'personal_user', label: 'کاربر عادی' },
    { id: '', value: 'kitchen_staff', label: 'کارمند آشپزخانه' },
    { id: '', value: 'employee', label: 'کارمند' },
    { id: '', value: 'corporate_user', label: 'کاربر سازمانی' },
  ];

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

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      adminService.assignUserRole(userId, role),
    onSuccess: () => {
      toast.success('نقش کاربر با موفقیت تغییر کرد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRoleModalUser(null);
      setSelectedRole('');
    },
    onError: (error: any) => {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message;
      
      if (status === 403) {
        toast.error('شما دسترسی به این عملیات را ندارید');
      } else if (status === 401) {
        toast.error('لطفاً دوباره وارد شوید');
      } else {
        toast.error(message || 'خطا در تغییر نقش');
      }
    },
  });

  const handleOpenRoleModal = (user: { id: string; firstName: string; lastName: string; role: string }) => {
    setRoleModalUser({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      currentRole: user.role,
    });
    setSelectedRole(user.role);
  };

  const handleAssignRole = () => {
    if (roleModalUser && selectedRole && selectedRole !== roleModalUser.currentRole) {
      assignRoleMutation.mutate({ userId: roleModalUser.id, role: selectedRole });
    }
  };

  const users = data?.data || [];
  const pagination = data?.pagination;

  // Convert system roles to select options (use fallback if API fails)
  const availableRoles = systemRoles || (rolesError ? fallbackRoles : []);
  const roleSelectOptions = availableRoles.map((role: SystemRole) => ({
    value: role.value,
    label: role.label,
  }));

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
                      {userRoleLabels[user.role] || user.role}
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
                        <Button variant="ghost" size="sm" title="مشاهده">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {/* Role assignment button - only for super_admin */}
                      {isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRoleModal(user)}
                          className="text-primary-600"
                          title="تغییر نقش"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setToggleUserId(user.id)}
                        className={user.isActive ? 'text-error-600' : 'text-success-600'}
                        title={user.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
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

      {/* Role Assignment Modal - only for super_admin */}
      {isSuperAdmin && (
        <Modal
          isOpen={!!roleModalUser}
          onClose={() => { setRoleModalUser(null); setSelectedRole(''); }}
          title="تغییر نقش کاربر"
        >
          <div className="space-y-4">
            <p className="text-secondary-600">
              تغییر نقش کاربر: <span className="font-medium text-secondary-800">{roleModalUser?.name}</span>
            </p>
            
            <Select
              label="انتخاب نقش جدید"
              value={selectedRole}
              onValueChange={setSelectedRole}
              placeholder="نقش را انتخاب کنید"
              options={roleSelectOptions}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => { setRoleModalUser(null); setSelectedRole(''); }}
              >
                انصراف
              </Button>
              <Button
                onClick={handleAssignRole}
                disabled={!selectedRole || selectedRole === roleModalUser?.currentRole}
                isLoading={assignRoleMutation.isPending}
              >
                تغییر نقش
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
