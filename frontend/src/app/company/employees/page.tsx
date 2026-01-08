'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Upload, Trash2, Edit, MoreVertical } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/auth.store';
import { companyService, Employee } from '@/services/company.service';
import { formatPrice, toPersianDigits, toJalali } from '@/lib/utils/format';
import toast from 'react-hot-toast';

export default function CompanyEmployeesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const companyId = user?.companyId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');

  // Fetch employees
  const { data, isLoading } = useQuery({
    queryKey: ['company', companyId, 'employees', { page, search: searchQuery }],
    queryFn: () =>
      companyService.getEmployees(companyId!, {
        page,
        limit: 10,
        search: searchQuery || undefined,
      }),
    enabled: !!companyId,
  });

  const employees = data?.data || [];
  const pagination = data?.pagination;

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: (email: string) =>
      companyService.addEmployee(companyId!, { email }),
    onSuccess: () => {
      toast.success('کارمند با موفقیت اضافه شد');
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'employees'] });
      setShowAddModal(false);
      setNewEmployeeEmail('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در افزودن کارمند');
    },
  });

  // Remove employee mutation
  const removeEmployeeMutation = useMutation({
    mutationFn: (userId: string) =>
      companyService.removeEmployee(companyId!, userId),
    onSuccess: () => {
      toast.success('کارمند با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'employees'] });
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در حذف کارمند');
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: (file: File) =>
      companyService.bulkImportEmployees(companyId!, file),
    onSuccess: (result) => {
      toast.success(
        `${toPersianDigits(result.success)} کارمند با موفقیت اضافه شد${
          result.failed > 0 ? ` (${toPersianDigits(result.failed)} خطا)` : ''
        }`
      );
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'employees'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در وارد کردن فایل');
    },
  });

  const handleAddEmployee = () => {
    if (!newEmployeeEmail.trim()) {
      toast.error('لطفاً ایمیل کارمند را وارد کنید');
      return;
    }
    addEmployeeMutation.mutate(newEmployeeEmail.trim());
  };

  const handleDeleteEmployee = () => {
    if (selectedEmployee) {
      removeEmployeeMutation.mutate(selectedEmployee.userId);
    }
  };

  const handleBulkImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      bulkImportMutation.mutate(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">مدیریت کارمندان</h1>
        <p className="text-secondary-500">
          {pagination ? `${toPersianDigits(pagination.total)} کارمند` : 'لیست کارمندان'}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="جستجو بر اساس نام، ایمیل یا شماره تماس..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            rightIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="w-4 h-4" />}
            loading={bulkImportMutation.isPending}
          >
            وارد کردن Excel
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            افزودن کارمند
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleBulkImport}
          className="hidden"
        />
      </div>

      {/* Employees Table */}
      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-48 h-5 mb-2" />
                  <Skeleton variant="text" className="w-32 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-20 h-8 rounded-lg" />
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<UserPlus className="w-12 h-12" />}
              title={searchQuery ? 'کارمندی یافت نشد' : 'هنوز کارمندی اضافه نشده'}
              description={
                searchQuery
                  ? 'جستجوی دیگری امتحان کنید'
                  : 'اولین کارمند خود را اضافه کنید'
              }
              action={
                !searchQuery && (
                  <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    افزودن کارمند
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-100">
                  <tr>
                    <th className="text-right py-3 px-6 text-sm font-medium text-secondary-600">
                      کارمند
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-secondary-600">
                      ایمیل
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-secondary-600">
                      شماره تماس
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-secondary-600">
                      تاریخ عضویت
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-secondary-600">
                      وضعیت
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-secondary-600">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-secondary-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold">
                              {employee.firstName?.[0] || employee.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-secondary-800">
                              {employee.firstName && employee.lastName
                                ? `${employee.firstName} ${employee.lastName}`
                                : 'بدون نام'}
                            </p>
                            {employee.position && (
                              <p className="text-xs text-secondary-500">{employee.position}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-secondary-700">{employee.email}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-secondary-700">
                          {employee.phone || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-secondary-700">
                          {toJalali(employee.joinedAt || employee.createdAt, 'jYYYY/jMM/jDD')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={employee.isActive ? 'success' : 'default'}
                          size="sm"
                        >
                          {employee.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowDeleteModal(true);
                            }}
                            className="text-error-500 hover:text-error-600 hover:bg-error-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-secondary-100">
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
      </Card>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewEmployeeEmail('');
        }}
        title="افزودن کارمند جدید"
      >
        <div className="space-y-4">
          <Input
            label="ایمیل کارمند"
            type="email"
            placeholder="email@example.com"
            value={newEmployeeEmail}
            onChange={(e) => setNewEmployeeEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEmployee()}
          />
          <p className="text-sm text-secondary-500">
            کارمند باید قبلاً در سیستم ثبت‌نام کرده باشد
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setNewEmployeeEmail('');
              }}
            >
              انصراف
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleAddEmployee}
              loading={addEmployeeMutation.isPending}
            >
              افزودن
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleDeleteEmployee}
        title="حذف کارمند"
        message={`آیا از حذف ${
          selectedEmployee?.firstName && selectedEmployee?.lastName
            ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
            : selectedEmployee?.email
        } اطمینان دارید؟`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        variant="danger"
        loading={removeEmployeeMutation.isPending}
      />
    </DashboardLayout>
  );
}
