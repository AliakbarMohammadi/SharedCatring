"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { PageLoader } from "@/components/ui/spinner";
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Wallet,
  FileText,
  User,
  Bell,
} from "lucide-react";

const dashboardItems = [
  { title: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
  { title: "سفارش‌های من", href: "/dashboard/orders", icon: ShoppingBag },
  { title: "رزرو هفتگی", href: "/dashboard/reservations", icon: Calendar },
  { title: "کیف پول", href: "/dashboard/wallet", icon: Wallet },
  { title: "فاکتورها", href: "/dashboard/invoices", icon: FileText },
  { title: "اعلان‌ها", href: "/dashboard/notifications", icon: Bell },
  { title: "پروفایل", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar items={dashboardItems} title="پنل کاربری" />
      <main className="lg:pr-64">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
