"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { PageLoader } from "@/components/ui/spinner";
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";

const companyItems = [
  { title: "داشبورد", href: "/company", icon: LayoutDashboard },
  { title: "کارمندان", href: "/company/employees", icon: Users },
  { title: "کیف پول شرکت", href: "/company/wallet", icon: Wallet },
  { title: "قوانین یارانه", href: "/company/subsidy", icon: Building2 },
  { title: "فاکتورها", href: "/company/invoices", icon: FileText },
  { title: "گزارش‌ها", href: "/company/reports", icon: BarChart3 },
  { title: "تنظیمات", href: "/company/settings", icon: Settings },
];

export default function CompanyLayout({
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
      } else if (user?.role !== "company_admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || user?.role !== "company_admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar items={companyItems} title="پنل شرکت" />
      <main className="lg:pr-64">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
