'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Building2, TrendingUp, Calendar, ShoppingBag, ChevronLeft, Percent, Wallet } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/auth.store';
import { companyService } from '@/services/company.service';
import { menuService } from '@/services/menu.service';
import { walletService } from '@/services/wallet.service';
import { orderService } from '@/services/order.service';
import { formatPrice, toPersianDigits, getTodayPersian } from '@/lib/utils/format';
import { useCartStore } from '@/stores/cart.store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

export default function EmployeeDashboardPage() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  // Fetch company info
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', 'my-company'],
    queryFn: companyService.getMyCompany,
    enabled: !!user?.companyId,
  });

  // Fetch subsidy info
  const { data: subsidyInfo, isLoading: subsidyLoading } = useQuery({
    queryKey: ['company', 'subsidy-info'],
    queryFn: companyService.getEmployeeSubsidyInfo,
    enabled: !!user?.companyId,
  });

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
  });

  // Fetch daily menu
  const { data: dailyMenu, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', 'daily'],
    queryFn: () => menuService.getDailyMenu(),
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', { limit: 5 }],
    queryFn: () => orderService.getOrders({ limit: 5 }),
  });

  const recentOrders = ordersData?.data || [];
  const menuItems = (dailyMenu?.items || []).slice(0, 4);

  const handleAddToCart = async (item: any) => {
    const food = item.food;
    const foodId = food._id || food.id;
    const originalPrice = food.pricing?.basePrice || food.effectivePrice || food.price;

    // Calculate subsidy if company has subsidy enabled
    let finalPrice = originalPrice;
    if (company?.settings?.subsidyEnabled && user?.companyId) {
      try {
        const subsidyCalc = await companyService.calculateSubsidy(user.companyId, [
          { foodId, quantity: 1, price: originalPrice },
        ]);
        finalPrice = subsidyCalc.userShare;
      } catch (error) {
        console.error('Error calculating subsidy:', error);
      }
    }

    addItem({
      foodId,
      foodName: food.name,
      unitPrice: finalPrice,
      image: food.image,
    });
    toast.success(`${food.name} به سبد خرید اضافه شد`);
  };

  const subsidyPercentage = subsidyInfo
    ? ((subsidyInfo.usedToday / subsidyInfo.dailyLimit) * 100).toFixed(0)
    : 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-1">
          سلام {user?.firstName} 👋
        </h1>
        <p className="text-secondary-500">{getTodayPersian()}</p>
      </div>

      {/* Company Info Banner */}
      {company && (
        <Card variant="elevated" className="mb-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{company.name}</h2>
                <p className="text-primary-100 text-sm">
                  {company.settings?.subsidyEnabled
                    ? 'یارانه غذا فعال است'
                    : 'بدون یارانه'}
                </p>
              </div>
              {company.settings?.subsidyEnabled && (
                <div className="text-left">
                  <div className="text-3xl font-bold">
                    {company.settings.subsidyType === 'percentage'
                      ? `${toPersianDigits(company.settings.subsidyValue)}%`
                      : formatPrice(company.settings.subsidyValue, false)}
                  </div>
                  <p className="text-primary-100 text-sm">یارانه</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Daily Subsidy Limit */}
        {company?.settings?.subsidyEnabled && (
          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-success-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-secondary-500">یارانه روزانه</p>
                {subsidyLoading ? (
                  <Skeleton variant="text" className="w-20 h-6" />
                ) : (
                  <p className="text-lg font-bold text-secondary-800">
                    {formatPrice(subsidyInfo?.dailyLimit || 0, false)}
                  </p>
                )}
              </div>
            </div>
            {!subsidyLoading && subsidyInfo && (
              <div>
                <div className="flex justify-between text-xs text-secondary-500 mb-1">
                  <span>استفاده شده</span>
                  <span>{formatPrice(subsidyInfo.usedToday, false)}</span>
                </div>
                <div className="w-full h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all rounded-full',
                      Number(subsidyPercentage) > 80
                        ? 'bg-error-500'
                        : Number(subsidyPercentage) > 50
                        ? 'bg-warning-500'
                        : 'bg-success-500'
                    )}
                    style={{ width: `${Math.min(Number(subsidyPercentage), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  باقیمانده: {formatPrice(subsidyInfo.remainingToday, false)}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Wallet Balance */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">موجودی کیف پول</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {formatPrice(wallet?.totalBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Company Balance */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">یارانه سازمانی</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {formatPrice(wallet?.companyBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Active Orders */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">سفارشات فعال</p>
              {ordersLoading ? (
                <Skeleton variant="text" className="w-12 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {toPersianDigits(
                    recentOrders.filter((o) =>
                      ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
                    ).length
                  )}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Menu with Subsidy */}
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="منوی امروز با یارانه"
              subtitle={
                company?.settings?.subsidyEnabled
                  ? 'قیمت‌ها شامل یارانه سازمانی'
                  : 'قیمت‌های عادی'
              }
              action={
                <Link href="/menu">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                    مشاهده همه
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {menuLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 border border-secondary-100 rounded-xl">
                      <Skeleton variant="rectangular" className="w-full h-32 rounded-lg mb-3" />
                      <Skeleton variant="text" className="w-3/4 h-5 mb-2" />
                      <Skeleton variant="text" className="w-1/2 h-4" />
                    </div>
                  ))}
                </div>
              ) : menuItems.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="w-12 h-12" />}
                  title="منوی امروز هنوز منتشر نشده"
                  description="لطفاً بعداً مراجعه کنید"
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {menuItems.map((item: any) => {
                    const food = item.food;
                    const foodId = food._id || food.id;
                    const originalPrice = food.pricing?.basePrice || food.effectivePrice || food.price;

                    // Mock subsidy calculation for display
                    const subsidyAmount = company?.settings?.subsidyEnabled
                      ? company.settings.subsidyType === 'percentage'
                        ? (originalPrice * company.settings.subsidyValue) / 100
                        : company.settings.subsidyValue
                      : 0;
                    const userShare = originalPrice - subsidyAmount;

                    return (
                      <div
                        key={foodId}
                        className="p-4 border border-secondary-100 rounded-xl hover:border-primary-200 transition-colors"
                      >
                        <div className="relative h-32 bg-secondary-100 rounded-lg overflow-hidden mb-3">
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              🍽️
                            </div>
                          )}
                        </div>

                        <h3 className="font-bold text-secondary-800 mb-2">{food.name}</h3>

                        {company?.settings?.subsidyEnabled ? (
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-secondary-500">قیمت اصلی:</span>
                              <span className="text-secondary-400 line-through">
                                {formatPrice(originalPrice, false)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-success-600">سهم شرکت:</span>
                              <span className="text-success-600 font-medium">
                                {formatPrice(subsidyAmount, false)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-secondary-700 font-medium">سهم شما:</span>
                              <span className="text-primary-600 font-bold text-lg">
                                {formatPrice(userShare, false)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-primary-600 font-bold text-lg mb-3">
                            {formatPrice(originalPrice)}
                          </p>
                        )}

                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.available}
                        >
                          افزودن به سبد
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="elevated" padding="lg">
            <CardHeader title="دسترسی سریع" />
            <CardContent className="space-y-3">
              <Link href="/employee/reservations">
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start"
                  leftIcon={<Calendar className="w-5 h-5" />}
                >
                  رزرو هفتگی
                </Button>
              </Link>
              <Link href="/menu">
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start"
                  leftIcon={<ShoppingBag className="w-5 h-5" />}
                >
                  مشاهده منو
                </Button>
              </Link>
              <Link href="/orders">
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start"
                  leftIcon={<TrendingUp className="w-5 h-5" />}
                >
                  سفارشات من
                </Button>
              </Link>
              <Link href="/wallet">
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start"
                  leftIcon={<Wallet className="w-5 h-5" />}
                >
                  کیف پول
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Monthly Subsidy Info */}
          {company?.settings?.subsidyEnabled && subsidyInfo && (
            <Card variant="elevated" padding="lg">
              <CardHeader title="یارانه ماهانه" />
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-600">سقف ماهانه:</span>
                  <span className="font-bold text-secondary-800">
                    {formatPrice(subsidyInfo.monthlyLimit, false)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">استفاده شده:</span>
                  <span className="font-bold text-warning-600">
                    {formatPrice(subsidyInfo.usedThisMonth, false)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-secondary-100">
                  <span className="text-secondary-700 font-medium">باقیمانده:</span>
                  <span className="font-bold text-success-600">
                    {formatPrice(subsidyInfo.remainingThisMonth, false)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
