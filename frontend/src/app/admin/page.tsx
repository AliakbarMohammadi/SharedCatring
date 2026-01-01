'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users,
  Building2,
  ClipboardList,
  Wallet,
  TrendingUp,
  ChevronLeft,
  DollarSign,
  UtensilsCrossed,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminService } from '@/services/admin.service';
import { formatPrice, toPersianDigits, toJalali, orderStatusLabels, orderStatusColors } from '@/lib/utils/format';

export default function AdminDashboardPage() {
  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getDashboardStats,
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'orders', { limit: 5 }],
    queryFn: () => adminService.getOrders({ limit: 5 }),
  });

  // Fetch pending companies
  const { data: pendingCompanies, isLoading: companiesLoading } = useQuery({
    queryKey: ['admin', 'companies', 'pending'],
    queryFn: () => adminService.getCompanies({ status: 'pending' }),
  });

  const recentOrders = ordersData?.data || [];

  return (
    <DashboardLayout variant="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">داشبورد مدیریت</h1>
        <p className="text-secondary-500">نمای کلی سیستم</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">درآمد امروز</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-24 h-6 bg-white/20" />
              ) : (
                <p className="text-lg font-bold">{formatPrice(stats?.todayRevenue || 0, false)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">سفارشات امروز</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-12 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">{toPersianDigits(stats?.todayOrders || 0)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">کاربران فعال</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-12 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">{toPersianDigits(stats?.activeUsers || 0)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">شرکت‌های فعال</p>
              {statsLoading ? (
                <Skeleton variant="text" className="w-12 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">{toPersianDigits(stats?.activeCompanies || 0)}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="دسترسی سریع" />
          <CardContent>
            <div className="space-y-3">
              <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors">
                <ClipboardList className="w-5 h-5 text-primary-600" />
                <span className="text-secondary-800">مدیریت سفارشات</span>
                <ChevronLeft className="w-4 h-4 text-secondary-400 mr-auto" />
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors">
                <Users className="w-5 h-5 text-primary-600" />
                <span className="text-secondary-800">مدیریت کاربران</span>
                <ChevronLeft className="w-4 h-4 text-secondary-400 mr-auto" />
              </Link>
              <Link href="/admin/companies" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors">
                <Building2 className="w-5 h-5 text-primary-600" />
                <span className="text-secondary-800">مدیریت شرکت‌ها</span>
                <ChevronLeft className="w-4 h-4 text-secondary-400 mr-auto" />
              </Link>
              <Link href="/admin/menu" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors">
                <UtensilsCrossed className="w-5 h-5 text-primary-600" />
                <span className="text-secondary-800">مدیریت منو</span>
                <ChevronLeft className="w-4 h-4 text-secondary-400 mr-auto" />
              </Link>
              <Link href="/admin/reports" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <span className="text-secondary-800">گزارشات</span>
                <ChevronLeft className="w-4 h-4 text-secondary-400 mr-auto" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="سفارشات اخیر"
            action={
              <Link href="/admin/orders">
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
                    <Skeleton variant="rectangular" className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton variant="text" className="w-20 h-4 mb-1" />
                      <Skeleton variant="text" className="w-16 h-3" />
                    </div>
                    <Skeleton variant="rectangular" className="w-16 h-6 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-lg">
                      🍱
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-800 text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-secondary-500">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <Badge variant={orderStatusColors[order.status] as any} size="sm">
                      {orderStatusLabels[order.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary-500 py-4">سفارشی وجود ندارد</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Companies */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="شرکت‌های در انتظار تأیید"
            action={
              <Link href="/admin/companies?status=pending">
                <Button variant="ghost" size="sm" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                  همه
                </Button>
              </Link>
            }
          />
          <CardContent>
            {companiesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton variant="rectangular" className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton variant="text" className="w-24 h-4 mb-1" />
                      <Skeleton variant="text" className="w-16 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingCompanies?.data && pendingCompanies.data.length > 0 ? (
              <div className="space-y-3">
                {pendingCompanies.data.slice(0, 5).map((company: any) => (
                  <Link
                    key={company.id}
                    href={`/admin/companies/${company.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-warning-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-800 text-sm">{company.name}</p>
                      <p className="text-xs text-secondary-500">{toJalali(company.createdAt, 'jYYYY/jMM/jDD')}</p>
                    </div>
                    <Badge variant="warning" size="sm">در انتظار</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary-500 py-4">شرکتی در انتظار تأیید نیست</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
