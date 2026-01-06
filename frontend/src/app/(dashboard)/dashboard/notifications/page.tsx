"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import apiClient from "@/lib/api-client";
import { Notification } from "@/types";
import { toast } from "@/components/ui/toast";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications");
      return res.data.data as Notification[];
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiClient.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast("همه اعلان‌ها خوانده شد", "success");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const categoryLabels: Record<string, string> = {
    order: "سفارش",
    payment: "پرداخت",
    system: "سیستم",
    promotion: "تخفیف",
  };

  if (isLoading) return <PageLoader />;

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">اعلان‌ها</h1>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `${unreadCount} اعلان خوانده نشده`
              : "همه اعلان‌ها خوانده شده"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="ml-2 h-4 w-4" />
            خواندن همه
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">اعلانی وجود ندارد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "cursor-pointer transition-colors",
                !notification.isRead && "border-orange-200 bg-orange-50"
              )}
              onClick={() => {
                if (!notification.isRead) {
                  markReadMutation.mutate(notification.id);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      notification.isRead ? "bg-gray-100" : "bg-orange-100"
                    )}
                  >
                    <Bell
                      className={cn(
                        "h-5 w-5",
                        notification.isRead
                          ? "text-gray-500"
                          : "text-orange-500"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <Badge variant="secondary">
                        {categoryLabels[notification.category] ||
                          notification.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{notification.body}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString(
                        "fa-IR"
                      )}{" "}
                      -{" "}
                      {new Date(notification.createdAt).toLocaleTimeString(
                        "fa-IR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
