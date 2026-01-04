/**
 * Next.js Middleware for Route Protection
 * میدلور محافظت از مسیرها
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Role-based route access
const roleRoutes: Record<string, string[]> = {
  super_admin: ['/admin', '/company', '/kitchen', '/menu', '/cart', '/orders', '/wallet', '/profile', '/checkout'],
  catering_admin: ['/admin', '/menu', '/cart', '/orders', '/wallet', '/profile', '/checkout'],
  admin: ['/admin', '/company', '/kitchen', '/menu', '/cart', '/orders', '/wallet', '/profile', '/checkout'],
  kitchen_staff: ['/kitchen', '/menu', '/profile'],
  company_admin: ['/company', '/menu', '/cart', '/orders', '/wallet', '/profile', '/checkout'],
  employee: ['/menu', '/cart', '/orders', '/wallet', '/profile', '/checkout'],
  corporate_user: ['/menu', '/cart', '/orders', '/wallet', '/profile', '/checkout'],
  personal_user: ['/menu', '/cart', '/orders', '/wallet', '/profile', '/checkout'],
};

// Default redirect paths for each role
const defaultRedirects: Record<string, string> = {
  super_admin: '/admin',
  catering_admin: '/admin',
  admin: '/admin',
  kitchen_staff: '/admin', // TODO: Create /kitchen/queue page
  company_admin: '/company',
  employee: '/menu',
  corporate_user: '/menu',
  personal_user: '/menu',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get auth data from cookie (set by client-side auth)
  const authCookie = request.cookies.get('catering-auth');
  
  let isAuthenticated = false;
  let userRole: string | null = null;
  
  if (authCookie?.value) {
    try {
      const authData = JSON.parse(authCookie.value);
      isAuthenticated = authData.state?.isAuthenticated || false;
      userRole = authData.state?.user?.role || null;
    } catch {
      // Invalid cookie, treat as unauthenticated
    }
  }
  
  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check role-based access
  if (userRole) {
    const allowedRoutes = roleRoutes[userRole] || [];
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
    
    if (!hasAccess) {
      // Redirect to default page for this role
      const defaultPath = defaultRedirects[userRole] || '/menu';
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }
  }
  
  // Handle root path redirect
  if (pathname === '/' || pathname === '/dashboard') {
    if (userRole) {
      const defaultPath = defaultRedirects[userRole] || '/menu';
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
