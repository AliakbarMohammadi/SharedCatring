"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount, openCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = getItemCount();

  const getDashboardLink = () => {
    if (!user) return "/auth/login";
    switch (user.role) {
      case "super_admin":
        return "/admin";
      case "company_admin":
        return "/company";
      case "kitchen_staff":
        return "/kitchen";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold text-gray-900">کترینگ</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/menu" className="text-gray-600 hover:text-orange-500">
              منو غذا
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-orange-500">
              درباره ما
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-orange-500">
              تماس با ما
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={openCart}
            className="relative rounded-lg p-2 hover:bg-gray-100"
          >
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                {itemCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link href={getDashboardLink()}>
                <Button variant="ghost" size="sm">
                  <User className="ml-2 h-4 w-4" />
                  {user?.firstName}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Link href="/auth/login">
                <Button variant="ghost">ورود</Button>
              </Link>
              <Link href="/auth/register">
                <Button>ثبت‌نام</Button>
              </Link>
            </div>
          )}

          <button
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="/menu" className="text-gray-600 hover:text-orange-500">
              منو غذا
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-orange-500">
              درباره ما
            </Link>
            {isAuthenticated ? (
              <>
                <Link href={getDashboardLink()} className="text-gray-600 hover:text-orange-500">
                  پنل کاربری
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-right text-red-500 hover:text-red-600"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-orange-500">
                  ورود
                </Link>
                <Link href="/auth/register" className="text-orange-500 hover:text-orange-600">
                  ثبت‌نام
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
