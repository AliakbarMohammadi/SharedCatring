'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Clock, CreditCard, Wallet, Building2, ChevronLeft, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore, selectCartTotal } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { orderService, CreateOrderData } from '@/services/order.service';
import { walletService } from '@/services/wallet.service';
import { userService } from '@/services/user.service';
import { formatPrice, toPersianDigits, toJalali } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد'),
  deliveryDate: z.string().min(1, 'تاریخ تحویل را انتخاب کنید'),
  deliveryTimeSlot: z.string().min(1, 'زمان تحویل را انتخاب کنید'),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

type PaymentMethod = 'wallet' | 'online' | 'company';

const timeSlots = [
  { id: '11-12', label: '۱۱:۰۰ - ۱۲:۰۰' },
  { id: '12-13', label: '۱۲:۰۰ - ۱۳:۰۰' },
  { id: '13-14', label: '۱۳:۰۰ - ۱۴:۰۰' },
  { id: '14-15', label: '۱۴:۰۰ - ۱۵:۰۰' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { items, promoCode, clearCart } = useCartStore();
  const subtotal = useCartStore(selectCartTotal);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [step, setStep] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
  });

  // Fetch user addresses
  const { data: addresses } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: userService.getAddresses,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (order) => {
      clearCart();
      toast.success('سفارش شما با موفقیت ثبت شد');
      router.push(`/orders/${order.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ثبت سفارش');
    },
  });

  const canUseWallet = (wallet?.totalBalance || 0) >= subtotal;
  const canUseCompany = user?.role === 'corporate_user' && (wallet?.companyBalance || 0) >= subtotal;

  const onSubmit = (data: CheckoutForm) => {
    const orderData: CreateOrderData = {
      items: items.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
        notes: item.notes,
      })),
      deliveryAddress: data.deliveryAddress,
      deliveryDate: data.deliveryDate,
      deliveryTimeSlot: data.deliveryTimeSlot,
      notes: data.notes,
      promoCode: promoCode || undefined,
      paymentMethod,
    };
    createOrderMutation.mutate(orderData);
  };

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">تکمیل سفارش</h1>
        <p className="text-secondary-500">اطلاعات تحویل و پرداخت را وارد کنید</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors',
              step >= s ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-400'
            )}>
              {step > s ? <Check className="w-5 h-5" /> : toPersianDigits(s)}
            </div>
            {s < 3 && (
              <div className={cn(
                'w-16 h-1 mx-2 rounded transition-colors',
                step > s ? 'bg-primary-500' : 'bg-secondary-100'
              )} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Info */}
            {step === 1 && (
              <Card variant="elevated" padding="lg">
                <CardHeader title="اطلاعات تحویل" subtitle="آدرس و زمان تحویل سفارش" />
                <CardContent className="space-y-4">
                  {/* Saved Addresses */}
                  {addresses && addresses.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <label className="text-sm font-medium text-secondary-700">آدرس‌های ذخیره شده</label>
                      <div className="grid gap-2">
                        {addresses.map((addr: any) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => setValue('deliveryAddress', addr.fullAddress)}
                            className={cn(
                              'p-3 rounded-lg border text-right transition-colors',
                              watch('deliveryAddress') === addr.fullAddress
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-secondary-200 hover:border-primary-300'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-secondary-400" />
                              <span className="font-medium">{addr.title}</span>
                            </div>
                            <p className="text-sm text-secondary-500 mt-1">{addr.fullAddress}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Input
                    label="آدرس تحویل"
                    placeholder="آدرس کامل محل تحویل سفارش"
                    {...register('deliveryAddress')}
                    error={errors.deliveryAddress?.message}
                    rightIcon={<MapPin className="w-5 h-5" />}
                  />

                  <Input
                    label="تاریخ تحویل"
                    type="date"
                    {...register('deliveryDate')}
                    error={errors.deliveryDate?.message}
                  />

                  <div>
                    <label className="text-sm font-medium text-secondary-700 mb-2 block">زمان تحویل</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setValue('deliveryTimeSlot', slot.id)}
                          className={cn(
                            'p-3 rounded-lg border text-center transition-colors',
                            watch('deliveryTimeSlot') === slot.id
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-200 hover:border-primary-300'
                          )}
                        >
                          <Clock className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-sm">{slot.label}</span>
                        </button>
                      ))}
                    </div>
                    {errors.deliveryTimeSlot && (
                      <p className="text-sm text-error-500 mt-1">{errors.deliveryTimeSlot.message}</p>
                    )}
                  </div>

                  <Input
                    label="توضیحات (اختیاری)"
                    placeholder="توضیحات اضافی برای سفارش"
                    {...register('notes')}
                  />

                  <Button type="button" variant="primary" fullWidth onClick={() => setStep(2)}>
                    ادامه
                    <ChevronLeft className="w-4 h-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card variant="elevated" padding="lg">
                <CardHeader title="روش پرداخت" subtitle="نحوه پرداخت سفارش را انتخاب کنید" />
                <CardContent className="space-y-4">
                  {/* Wallet Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    disabled={!canUseWallet}
                    className={cn(
                      'w-full p-4 rounded-xl border text-right transition-all',
                      paymentMethod === 'wallet'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-primary-300',
                      !canUseWallet && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-secondary-800">کیف پول</p>
                        <p className="text-sm text-secondary-500">
                          موجودی: {formatPrice(wallet?.personalBalance || 0)}
                        </p>
                      </div>
                      {paymentMethod === 'wallet' && (
                        <Check className="w-6 h-6 text-primary-500" />
                      )}
                    </div>
                    {!canUseWallet && (
                      <p className="text-sm text-error-500 mt-2">موجودی کافی نیست</p>
                    )}
                  </button>

                  {/* Company Subsidy */}
                  {user?.role === 'corporate_user' && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('company')}
                      disabled={!canUseCompany}
                      className={cn(
                        'w-full p-4 rounded-xl border text-right transition-all',
                        paymentMethod === 'company'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-primary-300',
                        !canUseCompany && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-success-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-secondary-800">یارانه سازمانی</p>
                          <p className="text-sm text-secondary-500">
                            موجودی: {formatPrice(wallet?.companyBalance || 0)}
                          </p>
                        </div>
                        {paymentMethod === 'company' && (
                          <Check className="w-6 h-6 text-primary-500" />
                        )}
                      </div>
                      {!canUseCompany && (
                        <p className="text-sm text-error-500 mt-2">موجودی یارانه کافی نیست</p>
                      )}
                    </button>
                  )}

                  {/* Online Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={cn(
                      'w-full p-4 rounded-xl border text-right transition-all',
                      paymentMethod === 'online'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-primary-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-secondary-800">پرداخت آنلاین</p>
                        <p className="text-sm text-secondary-500">درگاه بانکی</p>
                      </div>
                      {paymentMethod === 'online' && (
                        <Check className="w-6 h-6 text-primary-500" />
                      )}
                    </div>
                  </button>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      بازگشت
                    </Button>
                    <Button type="button" variant="primary" className="flex-1" onClick={() => setStep(3)}>
                      ادامه
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <Card variant="elevated" padding="lg">
                <CardHeader title="تأیید نهایی" subtitle="سفارش خود را بررسی و تأیید کنید" />
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary-50 rounded-xl space-y-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-500">آدرس تحویل:</span>
                      <span className="text-secondary-800">{watch('deliveryAddress')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">تاریخ تحویل:</span>
                      <span className="text-secondary-800">{watch('deliveryDate')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">زمان تحویل:</span>
                      <span className="text-secondary-800">
                        {timeSlots.find((s) => s.id === watch('deliveryTimeSlot'))?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">روش پرداخت:</span>
                      <span className="text-secondary-800">
                        {paymentMethod === 'wallet' && 'کیف پول'}
                        {paymentMethod === 'company' && 'یارانه سازمانی'}
                        {paymentMethod === 'online' && 'پرداخت آنلاین'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      بازگشت
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      loading={createOrderMutation.isPending}
                    >
                      ثبت سفارش
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card variant="elevated" padding="lg" className="sticky top-24">
              <CardHeader title="خلاصه سفارش" />
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.foodId} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.foodName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">🍽️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-800 truncate">{item.foodName}</p>
                        <p className="text-xs text-secondary-500">
                          {toPersianDigits(item.quantity)} × {formatPrice(item.unitPrice, false)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-secondary-800">
                        {formatPrice(item.unitPrice * item.quantity, false)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-secondary-100 pt-4 space-y-2">
                  <div className="flex justify-between text-secondary-600">
                    <span>جمع کل</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-secondary-800 pt-2 border-t border-secondary-100">
                    <span>مبلغ قابل پرداخت</span>
                    <span className="text-primary-600">{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
