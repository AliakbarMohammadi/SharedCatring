"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { PageLoader } from "@/components/ui/spinner";
import {
  LayoutDashboard,
  Building2,
  Users,
  UtensilsCrossed,
  Calendar,
  Tag,
  FileText,
  Settings,
} from "lucide-react";

const adminItems = [
  { title: "داشبورد", href: "/admin", icon: LayoutDashboard },
  { title: "شرکت‌ها", href: "/admin/companies", icon: Building2 },
  { title: "کاربران", href: "/admin/users", icon: Users },
  { title: "منو غذا", href: "/admin/menu", icon: UtensilsCrossed },
  { title: "برنامه‌ریزی", href: "/admin/schedule", icon: Calendar },
  { title: "تخفیف‌ها", href: "/admin/promotions", icon: Tag },
  { title: "گزارش‌ها", href: "/admin/reports", icon: FileText },
  { title: "تنظیمات", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (user?.role !== "super_admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || user?.role !== "super_admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar items={adminItems} title="پنل مدیریت" />
      <main className="lg:pr-64">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
