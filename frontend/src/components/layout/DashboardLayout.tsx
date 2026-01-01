'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils/cn';

interface DashboardLayoutProps {
  children: ReactNode;
  variant?: 'user' | 'company' | 'admin';
  showSearch?: boolean;
  showCart?: boolean;
}

export function DashboardLayout({
  children,
  variant = 'user',
  showSearch = true,
  showCart = true,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check role access
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (variant === 'admin' && user.role !== 'admin') {
        router.replace('/dashboard');
      }
      if (variant === 'company' && !['company_admin', 'admin'].includes(user.role)) {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, variant, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-100">
      <Sidebar variant={variant} />
      <div className="lg:mr-64 min-h-screen flex flex-col">
        <Header showSearch={showSearch} showCart={showCart} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
