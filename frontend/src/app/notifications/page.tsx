'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2, Settings } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { notificationService } from '@/services/notification.service';
import { toJalali, formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications({ limit: 50 }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      toast.success('همه اعلان‌ها خوانده شد');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '🍱';
      case 'payment': return '💳';
      case 'wallet': return '💰';
      case 'promo': return '🎁';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">اعلان‌ها</h1>
          <p className="text-secondary-500">
            {unreadCount > 0 ? `${unreadCount} اعلان خوانده نشده` : 'همه اعلان‌ها خوانده شده'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              loading={markAllAsReadMutation.isPending}
              rightIcon={<CheckCheck className="w-4 h-4" />}
            >
              خواندن همه
            </Button>
          )}
          <Link href="/profile/notifications">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="md">
              <div className="flex items-start gap-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-3/4 h-5 mb-2" />
                  <Skeleton variant="text" className="w-full h-4 mb-2" />
                  <Skeleton variant="text" className="w-24 h-3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-16 h-16" />}
          title="اعلانی وجود ندارد"
          description="اعلان‌های جدید در اینجا نمایش داده می‌شود"
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification: any) => (
            <Card
              key={notification.id}
              variant="elevated"
              padding="md"
              className={cn(
                'transition-colors cursor-pointer',
                !notification.isRead && 'bg-primary-50/50 border-primary-100'
              )}
              onClick={() => {
                if (!notification.isRead) {
                  markAsReadMutation.mutate(notification.id);
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={cn(
                      'text-secondary-800',
                      !notification.isRead && 'font-bold'
                    )}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <Badge variant="primary" size="sm">جدید</Badge>
                    )}
                  </div>
                  <p className="text-secondary-600 text-sm mb-2">{notification.message}</p>
                  <p className="text-xs text-secondary-400">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
