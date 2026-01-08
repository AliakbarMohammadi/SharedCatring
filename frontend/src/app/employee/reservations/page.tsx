'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight, Check, X, ShoppingCart, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/auth.store';
import { companyService } from '@/services/company.service';
import { menuService } from '@/services/menu.service';
import { formatPrice, toPersianDigits, toJalali } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

// Helper to get week days
const getWeekDays = (startDate: Date) => {
  const days = [];
  const current = new Date(startDate);
  current.setDate(current.getDate() - current.getDay() + 6); // Start from Saturday

  for (let i = 0; i < 7; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const persianDayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

interface ReservationItem {
  foodId: string;
  foodName: string;
  quantity: number;
  originalPrice: number;
  subsidyAmount: number;
  userPayable: number;
  image?: string;
}

export default function EmployeeReservationsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [reservations, setReservations] = useState<Record<string, ReservationItem[]>>({});

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  // Fetch company info for subsidy calculation
  const { data: company } = useQuery({
    queryKey: ['company', 'my-company'],
    queryFn: companyService.getMyCompany,
    enabled: !!user?.companyId,
  });

  // Fetch weekly menu
  const { data: weeklyMenu, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', 'weekly', weekDays[0].toISOString()],
    queryFn: () => menuService.getWeeklyMenu(weekDays[0].toISOString().split('T')[0]),
  });

  // Fetch existing reservations
  const { data: existingReservations } = useQuery({
    queryKey: ['reservations', 'weekly', weekDays[0].toISOString()],
    queryFn: () => companyService.getWeeklyReservations(weekDays[0].toISOString().split('T')[0]),
    enabled: !!user?.companyId,
  });

  // Create reservation mutation
  const createReservationMutation = useMutation({
    mutationFn: companyService.createReservation,
    onSuccess: () => {
      toast.success('رزرو با موفقیت ثبت شد');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setReservations({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ثبت رزرو');
    },
  });

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowMenuModal(true);
  };

  const handleAddToReservation = async (food: any) => {
    if (!selectedDate) return;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const originalPrice = food.pricing?.basePrice || food.effectivePrice || food.price;

    // Calculate subsidy
    let subsidyAmount = 0;
    let userPayable = originalPrice;

    if (company?.settings?.subsidyEnabled && user?.companyId) {
      try {
        const subsidyCalc = await companyService.calculateSubsidy(user.companyId, [
          { foodId: food._id || food.id, quantity: 1, price: originalPrice },
        ]);
        subsidyAmount = subsidyCalc.subsidyAmount;
        userPayable = subsidyCalc.userShare;
      } catch (error) {
        // Use mock calculation if API fails
        if (company.settings.subsidyType === 'percentage') {
          subsidyAmount = (originalPrice * company.settings.subsidyValue) / 100;
        } else {
          subsidyAmount = company.settings.subsidyValue;
        }
        userPayable = originalPrice - subsidyAmount;
      }
    }

    const newItem: ReservationItem = {
      foodId: food._id || food.id,
      foodName: food.name,
      quantity: 1,
      originalPrice,
      subsidyAmount,
      userPayable,
      image: food.image,
    };

    setReservations((prev) => {
      const dayReservations = prev[dateKey] || [];
      const existingIndex = dayReservations.findIndex((item) => item.foodId === newItem.foodId);

      if (existingIndex >= 0) {
        const updated = [...dayReservations];
        updated[existingIndex].quantity += 1;
        return { ...prev, [dateKey]: updated };
      }

      return { ...prev, [dateKey]: [...dayReservations, newItem] };
    });

    toast.success(`${food.name} به رزرو ${toJalali(selectedDate, 'jMM/jDD')} اضافه شد`);
  };

  const handleRemoveFromReservation = (dateKey: string, foodId: string) => {
    setReservations((prev) => {
      const dayReservations = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: dayReservations.filter((item) => item.foodId !== foodId),
      };
    });
  };

  const handleSubmitReservations = () => {
    const reservationPromises = Object.entries(reservations).map(([date, items]) => {
      if (items.length === 0) return null;
      return createReservationMutation.mutateAsync({
        date,
        items: items.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity,
        })),
      });
    });

    Promise.all(reservationPromises.filter(Boolean));
  };

  // Calculate totals
  const weekTotals = useMemo(() => {
    let totalOriginal = 0;
    let totalSubsidy = 0;
    let totalPayable = 0;

    Object.values(reservations).forEach((dayItems) => {
      dayItems.forEach((item) => {
        totalOriginal += item.originalPrice * item.quantity;
        totalSubsidy += item.subsidyAmount * item.quantity;
        totalPayable += item.userPayable * item.quantity;
      });
    });

    return { totalOriginal, totalSubsidy, totalPayable };
  }, [reservations]);

  const selectedDayMenu = useMemo(() => {
    if (!selectedDate || !weeklyMenu?.days) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayMenu = weeklyMenu.days.find((d) => d.date.startsWith(dateStr));
    return dayMenu?.items || [];
  }, [selectedDate, weeklyMenu]);

  const hasReservations = Object.values(reservations).some((items) => items.length > 0);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">رزرو هفتگی</h1>
        <p className="text-secondary-500">غذای هفته خود را از قبل رزرو کنید</p>
      </div>

      {/* Week Navigator */}
      <Card variant="elevated" padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek} rightIcon={<ChevronRight className="w-4 h-4" />}>
            هفته قبل
          </Button>
          <h2 className="text-lg font-bold text-secondary-800">
            {toJalali(weekDays[0], 'jMMMM jYYYY')}
          </h2>
          <Button variant="outline" size="sm" onClick={handleNextWeek} leftIcon={<ChevronLeft className="w-4 h-4" />}>
            هفته بعد
          </Button>
        </div>

        {/* Week Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dateKey = day.toISOString().split('T')[0];
            const dayReservations = reservations[dateKey] || [];
            const isToday = day.toDateString() === new Date().toDateString();
            const isPast = day < new Date() && !isToday;

            return (
              <button
                key={index}
                onClick={() => !isPast && handleDayClick(day)}
                disabled={isPast}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-center',
                  isPast
                    ? 'border-secondary-100 bg-secondary-50 opacity-50 cursor-not-allowed'
                    : dayReservations.length > 0
                    ? 'border-success-500 bg-success-50 hover:bg-success-100'
                    : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50',
                  isToday && 'ring-2 ring-primary-500'
                )}
              >
                <div className="text-xs text-secondary-500 mb-1">{persianDayNames[index]}</div>
                <div className="text-lg font-bold text-secondary-800 mb-2">
                  {toJalali(day, 'jDD')}
                </div>
                {dayReservations.length > 0 ? (
                  <Badge variant="success" size="sm">
                    {toPersianDigits(dayReservations.length)} رزرو
                  </Badge>
                ) : (
                  <div className="text-xs text-secondary-400">بدون رزرو</div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Reservations Summary */}
      {hasReservations && (
        <Card variant="elevated" padding="lg" className="mb-6">
          <CardHeader title="خلاصه رزروهای هفته" />
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reservations).map(([dateKey, items]) => {
                if (items.length === 0) return null;
                const date = new Date(dateKey);

                return (
                  <div key={dateKey} className="p-4 bg-secondary-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-secondary-800">
                        {persianDayNames[date.getDay() === 0 ? 6 : date.getDay() - 1]} - {toJalali(date, 'jMM/jDD')}
                      </h3>
                      <Badge variant="default" size="sm">
                        {toPersianDigits(items.length)} آیتم
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.foodId} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                          <div className="w-12 h-12 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.foodName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-secondary-800 text-sm">{item.foodName}</p>
                            <p className="text-xs text-secondary-500">
                              تعداد: {toPersianDigits(item.quantity)} × {formatPrice(item.userPayable, false)}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-primary-600 text-sm">
                              {formatPrice(item.userPayable * item.quantity, false)}
                            </p>
                            {item.subsidyAmount > 0 && (
                              <p className="text-xs text-success-600">
                                یارانه: {formatPrice(item.subsidyAmount * item.quantity, false)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveFromReservation(dateKey, item.foodId)}
                            className="text-error-500 hover:text-error-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Week Totals */}
            <div className="mt-6 p-4 bg-primary-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">جمع کل اصلی:</span>
                <span className="font-medium text-secondary-800">
                  {formatPrice(weekTotals.totalOriginal)}
                </span>
              </div>
              {weekTotals.totalSubsidy > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success-600">یارانه شرکت:</span>
                  <span className="font-medium text-success-600">
                    -{formatPrice(weekTotals.totalSubsidy)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary-200">
                <span className="text-secondary-800">مبلغ قابل پرداخت:</span>
                <span className="text-primary-600">{formatPrice(weekTotals.totalPayable)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-6"
              onClick={handleSubmitReservations}
              loading={createReservationMutation.isPending}
              rightIcon={<Check className="w-5 h-5" />}
            >
              ثبت رزروهای هفته
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Menu Selection Modal */}
      <Modal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        title={selectedDate ? `منوی ${toJalali(selectedDate, 'jYYYY/jMM/jDD')}` : 'منو'}
      >
        {menuLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton variant="rectangular" className="w-20 h-20 rounded-lg" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-3/4 h-5 mb-2" />
                  <Skeleton variant="text" className="w-1/2 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : selectedDayMenu.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="منویی برای این روز وجود ندارد"
            description="لطفاً روز دیگری را انتخاب کنید"
          />
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedDayMenu.map((item: any) => {
              const food = item.food;
              const originalPrice = food.pricing?.basePrice || food.effectivePrice || food.price;

              // Mock subsidy calculation
              const subsidyAmount = company?.settings?.subsidyEnabled
                ? company.settings.subsidyType === 'percentage'
                  ? (originalPrice * company.settings.subsidyValue) / 100
                  : company.settings.subsidyValue
                : 0;
              const userShare = originalPrice - subsidyAmount;

              return (
                <div
                  key={food._id || food.id}
                  className="flex gap-3 p-3 border border-secondary-100 rounded-xl hover:border-primary-200 transition-colors"
                >
                  <div className="w-20 h-20 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                    {food.image ? (
                      <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-secondary-800 mb-1">{food.name}</h4>
                    {company?.settings?.subsidyEnabled ? (
                      <div className="space-y-1">
                        <p className="text-xs text-secondary-400 line-through">
                          {formatPrice(originalPrice, false)}
                        </p>
                        <p className="text-sm text-primary-600 font-bold">
                          {formatPrice(userShare, false)}
                        </p>
                        <p className="text-xs text-success-600">
                          یارانه: {formatPrice(subsidyAmount, false)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-primary-600 font-bold">{formatPrice(originalPrice)}</p>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddToReservation(food)}
                    disabled={!item.available}
                  >
                    افزودن
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
