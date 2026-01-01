'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  ShoppingCart,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { notificationService } from '@/services/notification.service';
import { formatPrice, toPersianDigits } from '@/lib/utils/format';

interface HeaderProps {
  showSearch?: boolean;
  showCart?: boolean;
}

export function Header({ showSearch = true, showCart = true }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  );
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-secondary-100">
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Search */}
        {showSearch && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="جستجوی غذا..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pr-10 pl-4 bg-secondary-50 border-0 rounded-xl text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          {showCart && (
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-secondary-600" />
              {cartItemCount > 0 && (
                <>
                  <span className="hidden sm:inline text-sm font-medium text-secondary-700">
                    {formatPrice(cartTotal, false)}
                  </span>
                  <span className="absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center bg-primary-500 text-white text-xs font-bold rounded-full">
                    {toPersianDigits(cartItemCount)}
                  </span>
                </>
              )}
            </Link>
          )}

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl hover:bg-secondary-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-secondary-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center bg-error-500 text-white text-xs font-bold rounded-full">
                {toPersianDigits(unreadCount > 9 ? '۹+' : unreadCount)}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-secondary-100 transition-colors">
                <Avatar
                  src={user?.avatar}
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  size="sm"
                />
                <span className="hidden sm:inline text-sm font-medium text-secondary-700">
                  {user?.firstName}
                </span>
                <ChevronDown className="w-4 h-4 text-secondary-400" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-white rounded-xl shadow-soft-lg border border-secondary-100 p-1 animate-slide-down z-50"
                sideOffset={8}
                align="end"
              >
                <div className="px-3 py-2 border-b border-secondary-100 mb-1">
                  <p className="font-medium text-secondary-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-secondary-500">{user?.email}</p>
                </div>

                <DropdownMenu.Item asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-secondary-700 rounded-lg hover:bg-secondary-100 cursor-pointer outline-none"
                  >
                    <User className="w-4 h-4" />
                    <span>پروفایل</span>
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-secondary-700 rounded-lg hover:bg-secondary-100 cursor-pointer outline-none"
                  >
                    <Settings className="w-4 h-4" />
                    <span>تنظیمات</span>
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-secondary-100 my-1" />

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-error-500 rounded-lg hover:bg-error-50 cursor-pointer outline-none"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
