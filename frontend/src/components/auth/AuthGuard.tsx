'use client';

/**
 * Auth Guard Component
 * کامپوننت محافظ احراز هویت
 */

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore, getRedirectPath, hasRouteAccess } from '@/stores/auth.store';

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for hydration
    if (!_hasHydrated) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role-based access
    if (user && !hasRouteAccess(user.role, pathname)) {
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
      return;
    }

    // Check specific required roles
    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, pathname, router, _hasHydrated, requiredRoles]);

  // Show loading while checking auth
  if (isLoading || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if no access
  if (user && !hasRouteAccess(user.role, pathname)) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
