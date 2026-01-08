'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/auth.store';
import { companyService, SubsidyRule, CreateSubsidyRuleRequest } from '@/services/company.service';
import { formatPrice, toPersianDigits, toJalali } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

const subsidyRuleSchema = z.object({
  name: z.string().min(1, 'نام قانون الزامی است'),
  type: z.enum(['percentage', 'fixed', 'tiered']),
  value: z.number().min(0, 'مقدار باید مثبت باشد'),
  maxAmount: z.number().optional(),
  minOrderAmount: z.number().optional(),
  mealTypes: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
});

type SubsidyRuleForm = z.infer<typeof subsidyRuleSchema>;

const mealTypeOptions = [
  { value: 'lunch', label: 'ناهار' },
  { value: 'dinner', label: 'شام' },
  { value: 'breakfast', label: 'صبحانه' },
];

export default function SubsidyRulesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const companyId = user?.companyId;

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRule, setEditingRule] = useState<SubsidyRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<SubsidyRule | null>(null);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SubsidyRuleForm>({
    resolver: zodResolver(subsidyRuleSchema),
    defaultValues: {
      type: 'percentage',
      isActive: true,
      priority: 1,
    },
  });

  const ruleType = watch('type');

  // Fetch subsidy rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['company', companyId, 'subsidy-rules'],
    queryFn: () => companyService.getSubsidyRules(companyId!),
    enabled: !!companyId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSubsidyRuleRequest) =>
      companyService.createSubsidyRule(companyId!, data),
    onSuccess: () => {
      toast.success('قانون یارانه با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'subsidy-rules'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ایجاد قانون یارانه');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: Partial<CreateSubsidyRuleRequest> }) =>
      companyService.updateSubsidyRule(companyId!, ruleId, data),
    onSuccess: () => {
      toast.success('قانون یارانه با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'subsidy-rules'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی قانون یارانه');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (ruleId: string) =>
      companyService.deleteSubsidyRule(companyId!, ruleId),
    onSuccess: () => {
      toast.success('قانون یارانه با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'subsidy-rules'] });
      setShowDeleteModal(false);
      setDeletingRule(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در حذف قانون یارانه');
    },
  });

  const handleOpenModal = (rule?: SubsidyRule) => {
    if (rule) {
      setEditingRule(rule);
      reset({
        name: rule.name,
        type: rule.type,
        value: rule.value,
        maxAmount: rule.maxAmount,
        minOrderAmount: rule.minOrderAmount,
        isActive: rule.isActive,
        priority: rule.priority,
      });
      setSelectedMealTypes(rule.mealTypes || []);
    } else {
      setEditingRule(null);
      reset({
        type: 'percentage',
        isActive: true,
        priority: 1,
      });
      setSelectedMealTypes([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
    reset();
    setSelectedMealTypes([]);
  };

  const handleToggleMealType = (mealType: string) => {
    setSelectedMealTypes((prev) =>
      prev.includes(mealType)
        ? prev.filter((t) => t !== mealType)
        : [...prev, mealType]
    );
  };

  const onSubmit = (data: SubsidyRuleForm) => {
    const payload: CreateSubsidyRuleRequest = {
      ...data,
      mealTypes: selectedMealTypes.length > 0 ? selectedMealTypes : undefined,
    };

    if (editingRule) {
      updateMutation.mutate({ ruleId: editingRule.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (deletingRule) {
      deleteMutation.mutate(deletingRule.id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      case 'fixed':
        return <DollarSign className="w-5 h-5" />;
      case 'tiered':
        return <Tag className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'درصدی';
      case 'fixed':
        return 'مبلغ ثابت';
      case 'tiered':
        return 'سطحی';
      default:
        return type;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">قوانین یارانه</h1>
        <p className="text-secondary-500">مدیریت قوانین یارانه سازمانی</p>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          افزودن قانون جدید
        </Button>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <Skeleton variant="text" className="w-48 h-6 mb-2" />
              <Skeleton variant="text" className="w-full h-4" />
            </Card>
          ))}
        </div>
      ) : !rules || rules.length === 0 ? (
        <Card variant="elevated" padding="lg">
          <EmptyState
            icon={<Tag className="w-12 h-12" />}
            title="هنوز قانونی تعریف نشده"
            description="اولین قانون یارانه خود را ایجاد کنید"
            action={
              <Button variant="primary" onClick={() => handleOpenModal()}>
                افزودن قانون
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} variant="elevated" padding="lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    rule.type === 'percentage' && 'bg-primary-100 text-primary-600',
                    rule.type === 'fixed' && 'bg-success-100 text-success-600',
                    rule.type === 'tiered' && 'bg-warning-100 text-warning-600'
                  )}>
                    {getTypeIcon(rule.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-secondary-800">{rule.name}</h3>
                      <Badge variant={rule.isActive ? 'success' : 'default'} size="sm">
                        {rule.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-secondary-500">نوع:</span>
                        <span className="font-medium text-secondary-800">{getTypeLabel(rule.type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-secondary-500">مقدار:</span>
                        <span className="font-bold text-primary-600">
                          {rule.type === 'percentage'
                            ? `${toPersianDigits(rule.value)}%`
                            : formatPrice(rule.value, false)}
                        </span>
                      </div>
                      {rule.maxAmount && (
                        <div className="flex items-center gap-2">
                          <span className="text-secondary-500">حداکثر:</span>
                          <span className="font-medium text-secondary-800">
                            {formatPrice(rule.maxAmount, false)}
                          </span>
                        </div>
                      )}
                      {rule.minOrderAmount && (
                        <div className="flex items-center gap-2">
                          <span className="text-secondary-500">حداقل سفارش:</span>
                          <span className="font-medium text-secondary-800">
                            {formatPrice(rule.minOrderAmount, false)}
                          </span>
                        </div>
                      )}
                      {rule.mealTypes && rule.mealTypes.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-secondary-500">وعده‌ها:</span>
                          <div className="flex gap-1">
                            {rule.mealTypes.map((type) => (
                              <Badge key={type} variant="secondary" size="sm">
                                {mealTypeOptions.find((o) => o.value === type)?.label || type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-secondary-500">اولویت:</span>
                        <span className="font-medium text-secondary-800">
                          {toPersianDigits(rule.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(rule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletingRule(rule);
                      setShowDeleteModal(true);
                    }}
                    className="text-error-500 hover:text-error-600 hover:bg-error-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingRule ? 'ویرایش قانون یارانه' : 'افزودن قانون یارانه'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="نام قانون"
            placeholder="مثال: یارانه ناهار کارمندان"
            {...register('name')}
            error={errors.name?.message}
          />

          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">نوع یارانه</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'percentage', label: 'درصدی', icon: Percent },
                { value: 'fixed', label: 'مبلغ ثابت', icon: DollarSign },
                { value: 'tiered', label: 'سطحی', icon: Tag },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('type', value as any)}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-colors flex flex-col items-center gap-1',
                    ruleType === value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-primary-300'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label={ruleType === 'percentage' ? 'درصد یارانه' : 'مبلغ یارانه (تومان)'}
            type="number"
            placeholder={ruleType === 'percentage' ? '50' : '50000'}
            {...register('value', { valueAsNumber: true })}
            error={errors.value?.message}
          />

          <Input
            label="حداکثر مبلغ یارانه (تومان) - اختیاری"
            type="number"
            placeholder="100000"
            {...register('maxAmount', { valueAsNumber: true })}
            error={errors.maxAmount?.message}
          />

          <Input
            label="حداقل مبلغ سفارش (تومان) - اختیاری"
            type="number"
            placeholder="20000"
            {...register('minOrderAmount', { valueAsNumber: true })}
            error={errors.minOrderAmount?.message}
          />

          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">
              وعده‌های غذایی - اختیاری
            </label>
            <div className="flex flex-wrap gap-2">
              {mealTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggleMealType(option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-colors',
                    selectedMealTypes.includes(option.value)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-primary-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-secondary-500 mt-1">
              اگر انتخاب نکنید، برای همه وعده‌ها اعمال می‌شود
            </p>
          </div>

          <Input
            label="اولویت"
            type="number"
            placeholder="1"
            {...register('priority', { valueAsNumber: true })}
            error={errors.priority?.message}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-secondary-700">
              قانون فعال باشد
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingRule ? 'به‌روزرسانی' : 'ایجاد قانون'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingRule(null);
        }}
        onConfirm={handleDelete}
        title="حذف قانون یارانه"
        message={`آیا از حذف قانون "${deletingRule?.name}" اطمینان دارید؟`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
