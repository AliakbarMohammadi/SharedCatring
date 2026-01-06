"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { PageLoader } from "@/components/ui/spinner";
import { LayoutDashboard, ClipboardList, BarChart3 } from "lucide-react";

const kitchenItems = [
  { title: "صف سفارش‌ها", href: "/kitchen", icon: LayoutDashboard },
  { title: "خلاصه روز", href: "/kitchen/summary", icon: BarChart3 },
];

export default function KitchenLayout({
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
      } else if (user?.role !== "kitchen_staff" && user?.role !== "super_admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar items={kitchenItems} title="پنل آشپزخانه" />
      <main className="lg:pr-64">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
