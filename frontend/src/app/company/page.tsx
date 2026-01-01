'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Wallet, ClipboardList, TrendingUp, ChevronLeft, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { companyService } from '@/services/company.service';
import { walletService } from '@/services/wallet.service';
import { formatPrice, toPersianDigits, toJalali, orderStatusLabels, orderStatusColors } from '@/lib/utils/format';

export default function CompanyDashboardPage() {
  // Fetch company info
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', 'info'],
    queryFn: companyService.getCompanyInfo,
  });

  // Fetch company wallet
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['company', 'wallet'],
    queryFn: companyService.getCompanyWallet,
  });

  // Fetch company stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['company', 'stats'],
    queryFn: companyService.getCompanyStats,
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['company', 'orders', { limit: 5 }],
    queryFn: () => companyService.getCompanyOrders({ limit: 5 }),
  });

  const recentOrders = ordersData?.data || [];

  return (
    <DashboardLayout variant="company">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            {companyLoading ? (
              <Skeleton variant="text" className="w-40 h-7" />
            ) : (
              <h1 className="text-2xl font-bold text-secondary-800">{company?.name}</h1>
            )}
            <p className="text-secondary-500">پنل مدیریت شرکت</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                  {formatPrice(wallet?.balance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">تعداد کارمندان</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-12 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {toPersianDigits(stats?.employeeCount || 0)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">سفارشات این ماه</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-12 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {toPersianDigits(stats?.monthlyOrders || 0)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">هزینه این ماه</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {formatPrice(stats?.monthlySpending || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="دسترسی سریع" />
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/company/employees">
                <div className="p-4 rounded-xl border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-center">
                  <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-secondary-800">مدیریت کارمندان</p>
                </div>
              </Link>
              <Link href="/company/wallet">
                <div className="p-4 rounded-xl border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-center">
                  <Wallet className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-secondary-800">کیف پول شرکت</p>
                </div>
              </Link>
              <Link href="/company/orders">
                <div className="p-4 rounded-xl border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-center">
                  <ClipboardList className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-secondary-800">سفارشات</p>
                </div>
              </Link>
              <Link href="/company/reports">
                <div className="p-4 rounded-xl border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-center">
                  <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-secondary-800">گزارشات</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="سفارشات اخیر کارمندان"
            action={
              <Link href="/company/orders">
                <Button variant="ghost" size="sm" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                  همه
                </Button>
              </Link>
            }
          />
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton variant="circular" className="w-10 h-10" />
                    <div className="flex-1">
                      <Skeleton variant="text" className="w-24 h-4 mb-1" />
                      <Skeleton variant="text" className="w-16 h-3" />
                    </div>
                    <Skeleton variant="rectangular" className="w-16 h-6" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/company/orders/${order.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-800 text-sm">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {formatPrice(order.totalAmount)} - {toJalali(order.createdAt, 'jMM/jDD')}
                      </p>
                    </div>
                    <Badge variant={orderStatusColors[order.status] as any} size="sm">
                      {orderStatusLabels[order.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500">سفارشی ثبت نشده است</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
