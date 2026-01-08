'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Wallet, TrendingUp, ShoppingBag, UserPlus, FileText, ChevronLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { companyService } from '@/services/company.service';
import { walletService } from '@/services/wallet.service';
import { formatPrice, toPersianDigits, getTodayPersian, toJalali } from '@/lib/utils/format';

export default function CompanyDashboardPage() {
  const { user } = useAuthStore();
  const companyId = user?.companyId;

  // Fetch company info
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getCompany(companyId!),
    enabled: !!companyId,
  });

  // Fetch company stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['company', companyId, 'stats'],
    queryFn: () => companyService.getCompanyStats(companyId!),
    enabled: !!companyId,
  });

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
  });

  // Fetch daily orders chart (last 7 days)
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['company', companyId, 'daily-orders-chart'],
    queryFn: () => {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 6);
      return companyService.getDailyOrdersChart(companyId!, {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
      });
    },
    enabled: !!companyId,
  });

  // Format chart data for Recharts
  const formattedChartData = chartData?.map((item) => ({
    date: toJalali(item.date, 'jMM/jDD'),
    سفارشات: item.orders,
    'مبلغ (هزار تومان)': Math.round(item.amount / 1000),
  })) || [];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-1">
          پنل مدیریت {company?.name || 'شرکت'}
        </h1>
        <p className="text-secondary-500">{getTodayPersian()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Employee Count */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">تعداد کارمندان</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-16 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {toPersianDigits(stats?.employeeCount || 0)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Wallet Balance */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-success-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-secondary-500">موجودی کیف پول</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800 truncate">
                  {formatPrice(wallet?.companyBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Monthly Orders */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">سفارشات ماه</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-16 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {toPersianDigits(stats?.monthlyOrders || 0)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Monthly Consumption */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-secondary-500">مصرف ماهانه</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800 truncate">
                  {formatPrice(stats?.monthlySpent || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Orders Chart */}
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="نمودار سفارشات روزانه"
              subtitle="۷ روز گذشته"
            />
            <CardContent>
              {chartLoading ? (
                <Skeleton variant="rectangular" className="w-full h-64 rounded-lg" />
              ) : formattedChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-secondary-500">
                  داده‌ای برای نمایش وجود ندارد
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formattedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        direction: 'rtl',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ direction: 'rtl' }}
                      iconType="circle"
                    />
                    <Bar dataKey="سفارشات" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="مبلغ (هزار تومان)" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card variant="elevated" padding="lg">
            <CardHeader title="مدیریت سریع" />
            <CardContent className="space-y-3">
              <Link href="/company/employees">
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start"
                  leftIcon={<Users className="w-5 h-5" />}
                >
                  مدیریت کارمندان
                </Button>
              </Link>
              <Link href="/company/join-requests">
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start"
                  leftIcon={<UserPlus className="w-5 h-5" />}
                >
                  درخواست‌های عضویت
                </Button>
              </Link>
              <Link href="/company/orders">
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start"
                  leftIcon={<ShoppingBag className="w-5 h-5" />}
                >
                  سفارشات شرکت
                </Button>
              </Link>
              <Link href="/company/reports">
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start"
                  leftIcon={<FileText className="w-5 h-5" />}
                >
                  گزارشات
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Subsidy Info */}
          {company?.settings?.subsidyEnabled && (
            <Card variant="elevated" padding="lg">
              <CardHeader title="اطلاعات یارانه" />
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-600">نوع یارانه:</span>
                  <span className="font-bold text-secondary-800">
                    {company.settings.subsidyType === 'percentage'
                      ? 'درصدی'
                      : company.settings.subsidyType === 'fixed'
                      ? 'مبلغ ثابت'
                      : 'سطحی'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">مقدار:</span>
                  <span className="font-bold text-primary-600">
                    {company.settings.subsidyType === 'percentage'
                      ? `${toPersianDigits(company.settings.subsidyValue)}%`
                      : formatPrice(company.settings.subsidyValue, false)}
                  </span>
                </div>
                {company.settings.maxSubsidyPerDay && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">سقف روزانه:</span>
                    <span className="font-bold text-secondary-800">
                      {formatPrice(company.settings.maxSubsidyPerDay, false)}
                    </span>
                  </div>
                )}
                {stats && (
                  <>
                    <div className="pt-3 border-t border-secondary-100" />
                    <div className="flex justify-between">
                      <span className="text-secondary-600">استفاده شده:</span>
                      <span className="font-bold text-warning-600">
                        {formatPrice(stats.subsidyUsed, false)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">باقیمانده:</span>
                      <span className="font-bold text-success-600">
                        {formatPrice(stats.subsidyRemaining, false)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
