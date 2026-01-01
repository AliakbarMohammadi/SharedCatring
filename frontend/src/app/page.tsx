'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, user } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated) {
      if (isAuthenticated) {
        // Redirect based on role
        if (user?.role === 'admin') {
          router.replace('/admin');
        } else if (user?.role === 'company_admin') {
          router.replace('/company');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, _hasHydrated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <Loader2 className="w-full h-full text-primary-500 animate-spin" />
        </div>
        <p className="text-secondary-600">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
