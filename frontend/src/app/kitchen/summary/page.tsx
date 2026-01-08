'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChefHat, Package, TrendingUp, Calendar, Download, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { kitchenService } from '@/services/kitchen.service';
import { toPersianDigits, getTodayPersian, toJalali } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export default function KitchenSummaryPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Fetch daily summary
  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['kitchen', 'summary', selectedDate],
    queryFn: () => kitchenService.getDailySummary(selectedDate),
    refetchInterval: 60000, // Auto-refresh every minute
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['kitchen', 'stats', selectedDate],
    queryFn: () => kitchenService.getStats(selectedDate),
    refetchInterval: 60000,
  });

  const totalItems = summary?.reduce((sum, item) => sum + item.totalQuantity, 0) || 0;
  const totalOrders = summary?.reduce((sum, item) => sum + item.totalOrders, 0) || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-secondary-800 flex items-center gap-2">
            <Package className="w-7 h-7 text-primary-600" />
            خلاصه روزانه
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              به‌روزرسانی
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              leftIcon={<Download className="w-4 h-4" />}
            >
              چاپ
            </Button>
          </div>
        </div>
        <p className="text-secondary-500">{getTodayPersian()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">کل اقلام</p>
              {isLoading ? (
                <Skeleton variant="text" className="w-16 h-8" />
              ) : (
                <p className="text-2xl font-bold text-secondary-800">
                  {toPersianDigits(totalItems)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-success-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">تعداد سفارشات</p>
              {isLoading ? (
                <Skeleton variant="text" className="w-16 h-8" />
              ) : (
                <p className="text-2xl font-bold text-secondary-800">
                  {toPersianDigits(stats?.totalToday || 0)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">انواع غذا</p>
              {isLoading ? (
                <Skeleton variant="text" className="w-16 h-8" />
              ) : (
                <p className="text-2xl font-bold text-secondary-800">
                  {toPersianDigits(summary?.length || 0)}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Table */}
      <Card variant="elevated" padding="none">
        <CardHeader title="لیست اقلام مورد نیاز" className="px-6 pt-6" />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton variant="text" className="w-8 h-8" />
                  <Skeleton variant="text" className="flex-1 h-5" />
                  <Skeleton variant="text" className="w-20 h-6" />
                </div>
              ))}
            </div>
          ) : !summary || summary.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Package className="w-12 h-12" />}
                title="سفارشی برای امروز وجود ندارد"
                description="سفارشات امروز در اینجا نمایش داده می‌شود"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-100">
                  <tr>
                    <th className="text-center py-4 px-6 text-sm font-medium text-secondary-600 w-20">
                      #
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-secondary-600">
                      نام غذا
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-secondary-600">
                      دسته‌بندی
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-secondary-600">
                      تعداد کل
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-secondary-600">
                      تعداد سفارشات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {summary.map((item, index) => (
                    <tr
                      key={item.foodId}
                      className={cn(
                        'hover:bg-secondary-50 transition-colors',
                        index % 2 === 0 ? 'bg-white' : 'bg-secondary-25'
                      )}
                    >
                      <td className="py-4 px-6 text-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
                          <span className="text-primary-700 font-bold">
                            {toPersianDigits(index + 1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-secondary-800 text-lg">{item.foodName}</p>
                      </td>
                      <td className="py-4 px-6">
                        {item.category ? (
                          <Badge variant="secondary" size="sm">
                            {item.category}
                          </Badge>
                        ) : (
                          <span className="text-secondary-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center bg-primary-100 text-primary-700 font-bold text-xl px-4 py-2 rounded-lg min-w-[80px]">
                          {toPersianDigits(item.totalQuantity)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-secondary-600 font-medium">
                          {toPersianDigits(item.totalOrders)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary-50 border-t-2 border-primary-200">
                  <tr>
                    <td colSpan={3} className="py-4 px-6 text-right font-bold text-secondary-800">
                      جمع کل
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center bg-primary-600 text-white font-bold text-xl px-4 py-2 rounded-lg min-w-[80px]">
                        {toPersianDigits(totalItems)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-secondary-800 font-bold text-lg">
                        {toPersianDigits(stats?.totalToday || 0)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button,
          nav,
          aside {
            display: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
