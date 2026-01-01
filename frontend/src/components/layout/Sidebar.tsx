'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  UtensilsCrossed,
  ShoppingCart,
  ClipboardList,
  Wallet,
  Bell,
  User,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar } from '@/components/ui/Avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const userNavItems: NavItem[] = [
  { label: 'داشبورد', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'منوی غذا', href: '/menu', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { label: 'سبد خرید', href: '/cart', icon: <ShoppingCart className="w-5 h-5" /> },
  { label: 'سفارشات', href: '/orders', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'کیف پول', href: '/wallet', icon: <Wallet className="w-5 h-5" /> },
  { label: 'اعلان‌ها', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
  { label: 'پروفایل', href: '/profile', icon: <User className="w-5 h-5" /> },
];

const companyNavItems: NavItem[] = [
  { label: 'داشبورد شرکت', href: '/company', icon: <Building2 className="w-5 h-5" /> },
  { label: 'کارمندان', href: '/company/employees', icon: <Users className="w-5 h-5" /> },
  { label: 'سفارشات شرکت', href: '/company/orders', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'کیف پول شرکت', href: '/company/wallet', icon: <Wallet className="w-5 h-5" /> },
  { label: 'گزارشات', href: '/company/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'تنظیمات', href: '/company/settings', icon: <Settings className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'داشبورد', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'شرکت‌ها', href: '/admin/companies', icon: <Building2 className="w-5 h-5" /> },
  { label: 'کاربران', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'سفارشات', href: '/admin/orders', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'منو', href: '/admin/menu', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { label: 'گزارشات', href: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'تنظیمات', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

interface SidebarProps {
  variant?: 'user' | 'company' | 'admin';
}

export function Sidebar({ variant = 'user' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems =
    variant === 'admin'
      ? adminNavItems
      : variant === 'company'
      ? companyNavItems
      : userNavItems;

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
          isActive
            ? 'bg-primary-500 text-white shadow-sm'
            : 'text-secondary-600 hover:bg-secondary-100'
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        {item.icon}
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-xl shadow-soft"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full bg-white border-l border-secondary-100 z-40',
          'flex flex-col transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-100">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="font-bold text-lg text-secondary-800">کترینگ</span>
            </Link>
          )}
          <button
            className="hidden lg:flex p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 text-secondary-400 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-secondary-100">
          <div
            className={cn(
              'flex items-center gap-3 mb-3',
              isCollapsed && 'justify-center'
            )}
          >
            <Avatar
              src={user?.avatar}
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              size="md"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-800 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-secondary-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
              'text-error-500 hover:bg-error-50 transition-colors',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>خروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
