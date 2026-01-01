'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Ticket } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore, selectCartTotal, selectCartItemCount } from '@/stores/cart.store';
import { formatPrice, toPersianDigits } from '@/lib/utils/format';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const [promoInput, setPromoInput] = useState('');
  const { items, updateQuantity, removeItem, promoCode, setPromoCode, clearCart } = useCartStore();
  const subtotal = useCartStore(selectCartTotal);
  const itemCount = useCartStore(selectCartItemCount);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    setPromoCode(promoInput.trim());
    toast.success('کد تخفیف اعمال شد');
    setPromoInput('');
  };

  const handleRemovePromo = () => {
    setPromoCode(null);
    toast.success('کد تخفیف حذف شد');
  };

  if (items.length === 0) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={<ShoppingBag className="w-16 h-16" />}
          title="سبد خرید شما خالی است"
          description="غذاهای مورد علاقه خود را از منو انتخاب کنید"
          action={
            <Link href="/menu">
              <Button variant="primary" size="lg">مشاهده منو</Button>
            </Link>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">سبد خرید</h1>
        <p className="text-secondary-500">{toPersianDigits(itemCount)} آیتم در سبد خرید شما</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.foodId} variant="elevated" padding="md">
              <div className="flex gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.foodName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link href={`/menu/${item.foodId}`}>
                      <h3 className="font-bold text-secondary-800 hover:text-primary-600 transition-colors">
                        {item.foodName}
                      </h3>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.foodId)}
                      className="text-error-500 hover:text-error-600 hover:bg-error-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-secondary-500 mb-3">
                    قیمت واحد: {formatPrice(item.unitPrice)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-bold">{toPersianDigits(item.quantity)}</span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-bold text-primary-600">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Button variant="ghost" onClick={clearCart} className="text-error-500 hover:text-error-600">
            <Trash2 className="w-4 h-4 ml-2" />
            پاک کردن سبد خرید
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card variant="elevated" padding="lg" className="sticky top-24">
            <CardHeader title="خلاصه سفارش" />
            <CardContent className="space-y-4">
              {/* Promo Code */}
              {promoCode ? (
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-success-600" />
                    <span className="text-success-700 font-medium">{promoCode}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="text-error-500">
                    حذف
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="کد تخفیف"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyPromo}>اعمال</Button>
                </div>
              )}

              <div className="border-t border-secondary-100 pt-4 space-y-3">
                <div className="flex justify-between text-secondary-600">
                  <span>جمع کل</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {promoCode && (
                  <div className="flex justify-between text-success-600">
                    <span>تخفیف</span>
                    <span>- {formatPrice(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-secondary-800 pt-3 border-t border-secondary-100">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="text-primary-600">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push('/checkout')}
                rightIcon={<ArrowLeft className="w-5 h-5" />}
              >
                ادامه و تکمیل سفارش
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
