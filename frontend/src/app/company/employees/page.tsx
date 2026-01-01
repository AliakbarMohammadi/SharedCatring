'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Plus, Search, Edit2, Trash2, Wallet, UserCheck, UserX } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { companyService, Employee } from '@/services/company.service';
import { formatPrice, toPersianDigits, formatPhone } from '@/lib/utils/format';
import toast from 'react-hot-toast';

const employeeSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  employeeCode: z.string().optional(),
  department: z.string().optional(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

export default function CompanyEmployeesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [subsidyModal, setSubsidyModal] = useState<{ employee: Employee; amount: number } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  // Fetch employees
  const { data, isLoading } = useQuery({
    queryKey: ['company', 'employees', { search: searchQuery }],
    queryFn: () => companyService.getEmployees({ search: searchQuery || undefined }),
  });

  // Add employee mutation
  const addMutation = useMutation({
    mutationFn: companyService.addEmployee,
    onSuccess: () => {
      toast.success('کارمند با موفقیت اضافه شد');
      queryClient.invalidateQueries({ queryKey: ['company', 'employees'] });
      setShowModal(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در افزودن کارمند');
    },
  });

  // Update employee mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      companyService.updateEmployee(id, data),
    onSuccess: () => {
      toast.success('کارمند با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['company', 'employees'] });
      setShowModal(false);
      setEditingEmployee(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی کارمند');
    },
  });

  // Delete employee mutation
  const deleteMutation = useMutation({
    mutationFn: companyService.removeEmployee,
    onSuccess: () => {
      toast.success('کارمند با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['company', 'employees'] });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در حذف کارمند');
    },
  });

  // Allocate subsidy mutation
  const subsidyMutation = useMutation({
    mutationFn: ({ employeeId, amount }: { employeeId: string; amount: number }) =>
      companyService.allocateSubsidy(employeeId, amount),
    onSuccess: () => {
      toast.success('یارانه با موفقیت تخصیص داده شد');
      queryClient.invalidateQueries({ queryKey: ['company', 'employees'] });
      setSubsidyModal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در تخصیص یارانه');
    },
  });

  const employees = data?.data || [];

  const onSubmit = (formData: EmployeeForm) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    reset({
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone,
      email: employee.email || '',
      employeeCode: employee.employeeCode || '',
      department: employee.department || '',
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    reset({ firstName: '', lastName: '', phone: '', email: '', employeeCode: '', department: '' });
    setShowModal(true);
  };

  return (
    <DashboardLayout variant="company">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">مدیریت کارمندان</h1>
          <p className="text-secondary-500">
            {toPersianDigits(employees.length)} کارمند
          </p>
        </div>
        <Button variant="primary" onClick={handleAddNew} rightIcon={<Plus className="w-4 h-4" />}>
          افزودن کارمند
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="جستجوی کارمند..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          rightIcon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Employees List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="md">
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-32 h-5 mb-2" />
                  <Skeleton variant="text" className="w-24 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-20 h-8" />
              </div>
            </Card>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          icon={<Users className="w-16 h-16" />}
          title="کارمندی یافت نشد"
          description={searchQuery ? 'کارمندی با این مشخصات وجود ندارد' : 'هنوز کارمندی اضافه نکرده‌اید'}
          action={
            !searchQuery && (
              <Button variant="primary" onClick={handleAddNew}>
                افزودن کارمند
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {employees.map((employee) => (
            <Card key={employee.id} variant="elevated" padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">
                    {employee.firstName[0]}{employee.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-secondary-800">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <Badge variant={employee.isActive ? 'success' : 'secondary'} size="sm">
                      {employee.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary-500">
                    {formatPhone(employee.phone)}
                    {employee.department && ` • ${employee.department}`}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-secondary-500">موجودی یارانه</p>
                  <p className="font-bold text-primary-600">{formatPrice(employee.subsidyBalance, false)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubsidyModal({ employee, amount: 0 })}
                    title="تخصیص یارانه"
                  >
                    <Wallet className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(employee)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(employee.id)}
                    className="text-error-500 hover:bg-error-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingEmployee(null); }}
        title={editingEmployee ? 'ویرایش کارمند' : 'افزودن کارمند جدید'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="نام" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="نام خانوادگی" {...register('lastName')} error={errors.lastName?.message} />
          </div>
          <Input label="شماره موبایل" placeholder="09123456789" {...register('phone')} error={errors.phone?.message} />
          <Input label="ایمیل (اختیاری)" type="email" {...register('email')} error={errors.email?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="کد پرسنلی (اختیاری)" {...register('employeeCode')} />
            <Input label="دپارتمان (اختیاری)" {...register('department')} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingEmployee(null); }}>
              انصراف
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={addMutation.isPending || updateMutation.isPending}>
              {editingEmployee ? 'به‌روزرسانی' : 'افزودن'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subsidy Modal */}
      <Modal
        isOpen={!!subsidyModal}
        onClose={() => setSubsidyModal(null)}
        title="تخصیص یارانه"
      >
        {subsidyModal && (
          <div className="space-y-4">
            <p className="text-secondary-600">
              تخصیص یارانه به {subsidyModal.employee.firstName} {subsidyModal.employee.lastName}
            </p>
            <Input
              label="مبلغ (تومان)"
              type="number"
              value={subsidyModal.amount}
              onChange={(e) => setSubsidyModal({ ...subsidyModal, amount: Number(e.target.value) })}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSubsidyModal(null)}>انصراف</Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => subsidyMutation.mutate({ employeeId: subsidyModal.employee.id, amount: subsidyModal.amount })}
                loading={subsidyMutation.isPending}
              >
                تخصیص
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف کارمند"
        message="آیا از حذف این کارمند اطمینان دارید؟"
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
