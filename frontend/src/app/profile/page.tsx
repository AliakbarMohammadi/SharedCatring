'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, MapPin, Building2, Edit2, Plus, Trash2, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { userService } from '@/services/user.service';
import { userRoleLabels, formatPhone } from '@/lib/utils/format';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
});

const addressSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل ۲ کاراکتر باشد'),
  fullAddress: z.string().min(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد'),
  postalCode: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type AddressForm = z.infer<typeof addressSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  const { register: registerAddress, handleSubmit: handleAddressSubmit, reset: resetAddress, formState: { errors: addressErrors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  // Fetch addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: userService.getAddresses,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      setUser(data);
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل');
    },
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: userService.addAddress,
    onSuccess: () => {
      toast.success('آدرس با موفقیت اضافه شد');
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      setShowAddressModal(false);
      resetAddress();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در افزودن آدرس');
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressForm }) => userService.updateAddress(id, data),
    onSuccess: () => {
      toast.success('آدرس با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      setShowAddressModal(false);
      setEditingAddress(null);
      resetAddress();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی آدرس');
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: userService.deleteAddress,
    onSuccess: () => {
      toast.success('آدرس با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      setDeletingAddressId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در حذف آدرس');
    },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onAddressSubmit = (data: AddressForm) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data });
    } else {
      addAddressMutation.mutate(data);
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    resetAddress({
      title: address.title,
      fullAddress: address.fullAddress,
      postalCode: address.postalCode || '',
    });
    setShowAddressModal(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    resetAddress({ title: '', fullAddress: '', postalCode: '' });
    setShowAddressModal(true);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">پروفایل من</h1>
        <p className="text-secondary-500">مدیریت اطلاعات شخصی و آدرس‌ها</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="اطلاعات شخصی"
              action={
                !isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 ml-2" />
                    ویرایش
                  </Button>
                )
              }
            />
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="نام"
                      {...registerProfile('firstName')}
                      error={profileErrors.firstName?.message}
                    />
                    <Input
                      label="نام خانوادگی"
                      {...registerProfile('lastName')}
                      error={profileErrors.lastName?.message}
                    />
                  </div>
                  <Input
                    label="ایمیل"
                    type="email"
                    {...registerProfile('email')}
                    error={profileErrors.email?.message}
                  />
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      انصراف
                    </Button>
                    <Button type="submit" variant="primary" loading={updateProfileMutation.isPending}>
                      <Save className="w-4 h-4 ml-2" />
                      ذخیره تغییرات
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-secondary-100">
                    <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" />
                    <div>
                      <h3 className="text-lg font-bold text-secondary-800">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <Badge variant="secondary" size="sm">
                        {userRoleLabels[user?.role || 'personal_user']}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-secondary-400" />
                      <div>
                        <p className="text-sm text-secondary-500">شماره موبایل</p>
                        <p className="text-secondary-800 font-medium">{formatPhone(user?.phone || '')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-secondary-400" />
                      <div>
                        <p className="text-sm text-secondary-500">ایمیل</p>
                        <p className="text-secondary-800 font-medium">{user?.email || '-'}</p>
                      </div>
                    </div>
                    {user?.companyName && (
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-secondary-400" />
                        <div>
                          <p className="text-sm text-secondary-500">شرکت</p>
                          <p className="text-secondary-800 font-medium">{user.companyName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div>
          <Card variant="elevated" padding="lg">
            <CardHeader title="آمار" />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">تعداد سفارشات</span>
                <span className="font-bold text-secondary-800">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">تاریخ عضویت</span>
                <span className="font-bold text-secondary-800">-</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Addresses */}
      <Card variant="elevated" padding="lg" className="mt-6">
        <CardHeader
          title="آدرس‌های من"
          action={
            <Button variant="primary" size="sm" onClick={handleAddNewAddress}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن آدرس
            </Button>
          }
        />
        <CardContent>
          {addressesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 border border-secondary-100 rounded-xl">
                  <Skeleton variant="text" className="w-24 h-5 mb-2" />
                  <Skeleton variant="text" className="w-full h-4" />
                </div>
              ))}
            </div>
          ) : addresses && addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address: any) => (
                <div key={address.id} className="p-4 border border-secondary-100 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-secondary-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-secondary-800 mb-1">{address.title}</h4>
                        <p className="text-secondary-600 text-sm">{address.fullAddress}</p>
                        {address.postalCode && (
                          <p className="text-secondary-400 text-xs mt-1">کد پستی: {address.postalCode}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditAddress(address)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingAddressId(address.id)}
                        className="text-error-500 hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500">هنوز آدرسی ثبت نکرده‌اید</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => { setShowAddressModal(false); setEditingAddress(null); }}
        title={editingAddress ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}
      >
        <form onSubmit={handleAddressSubmit(onAddressSubmit)} className="space-y-4">
          <Input
            label="عنوان آدرس"
            placeholder="مثال: خانه، محل کار"
            {...registerAddress('title')}
            error={addressErrors.title?.message}
          />
          <Input
            label="آدرس کامل"
            placeholder="آدرس کامل را وارد کنید"
            {...registerAddress('fullAddress')}
            error={addressErrors.fullAddress?.message}
          />
          <Input
            label="کد پستی (اختیاری)"
            placeholder="کد پستی ۱۰ رقمی"
            {...registerAddress('postalCode')}
            error={addressErrors.postalCode?.message}
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowAddressModal(false); setEditingAddress(null); }}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={addAddressMutation.isPending || updateAddressMutation.isPending}
            >
              {editingAddress ? 'به‌روزرسانی' : 'افزودن'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingAddressId}
        onClose={() => setDeletingAddressId(null)}
        onConfirm={() => deletingAddressId && deleteAddressMutation.mutate(deletingAddressId)}
        title="حذف آدرس"
        message="آیا از حذف این آدرس اطمینان دارید؟"
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        variant="danger"
        loading={deleteAddressMutation.isPending}
      />
    </DashboardLayout>
  );
}
