'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Wallet, ClipboardList, TrendingUp, ChevronLeft, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { companyService } from '@/services/company.service';
import { walletService } from '@/services/wallet.service';
import { formatPrice, toPersianDigits, toJalali } from '@/lib/utils/format';

export default function CompanyDashboardPage() {
  const { user } = useAuthStore();
  const companyId = user?.companyId;

  // Fetch company info
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getMyCompany(),
    enabled: !!companyId,
  });

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
  });

  // Fetch company stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['company', companyId, 'stats'],
    queryFn: () => companyService.getCompanyStats(companyId!),
    enabled: !!companyId,
  });

  return (
    <DashboardLayout>
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
                  {formatPrice(wallet?.companyBalance || 0, false)}
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
                  {formatPrice(stats?.monthlySpent || 0, false)}
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
              <Link href="/company/dashboard">
                <div className="p-4 rounded-xl border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-center">
                  <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-secondary-800">داشبورد</p>
                </div>
              </Link>
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
              <Link href="/company/subsidy-rules">
                <div className="p-4 rounded-xl border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-center">
                  <ClipboardList className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-secondary-800">قوانین یارانه</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="اطلاعات شرکت" />
          <CardContent>
            {companyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton variant="text" className="w-24 h-4" />
                    <Skeleton variant="text" className="w-32 h-4" />
                  </div>
                ))}
              </div>
            ) : company ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-600">نام شرکت:</span>
                  <span className="font-medium text-secondary-800">{company.name}</span>
                </div>
                {company.email && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">ایمیل:</span>
                    <span className="font-medium text-secondary-800">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">تلفن:</span>
                    <span className="font-medium text-secondary-800">{company.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-secondary-600">وضعیت:</span>
                  <Badge variant={company.isActive ? 'success' : 'default'} size="sm">
                    {company.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
                {company.settings?.subsidyEnabled && (
                  <div className="pt-3 border-t border-secondary-100">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">یارانه:</span>
                      <Badge variant="success" size="sm">فعال</Badge>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500">اطلاعات شرکت یافت نشد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
