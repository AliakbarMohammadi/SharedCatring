"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import apiClient from "@/lib/api-client";
import { Order, OrderStatus } from "@/types";
import { toast } from "@/components/ui/toast";
import { Clock, ChefHat, CheckCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColumns: { status: OrderStatus; label: string; color: string }[] = [
  { status: "pending", label: "در صف", color: "bg-yellow-100" },
  { status: "preparing", label: "در حال آماده‌سازی", color: "bg-blue-100" },
  { status: "ready", label: "آماده تحویل", color: "bg-green-100" },
];

export default function KitchenQueuePage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["kitchen-queue"],
    queryFn: async () => {
      const res = await apiClient.get("/orders/kitchen/queue");
      return res.data.data as Order[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      return apiClient.patch(`/orders/kitchen/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast("وضعیت سفارش بروزرسانی شد", "success");
      queryClient.invalidateQueries({ queryKey: ["kitchen-queue"] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در بروزرسانی", "error");
    },
  });

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders?.filter((o) => o.status === status) || [];
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">صف سفارش‌ها</h1>
          <p className="text-gray-600">مدیریت سفارش‌های امروز</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="ml-2 h-4 w-4" />
          بروزرسانی
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 lg:grid-cols-3">
        {statusColumns.map((col) => (
          <div key={col.status} className={cn("rounded-xl p-4", col.color)}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{col.label}</h2>
              <Badge variant="secondary">
                {getOrdersByStatus(col.status).length}
              </Badge>
            </div>

            <div className="space-y-3">
              {getOrdersByStatus(col.status).map((order) => (
                <Card key={order.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-bold text-gray-900">
                        #{order.orderNumber}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="mb-3 space-y-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">{item.foodName}</span>
                          <span className="font-medium">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {col.status === "pending" && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            handleStatusChange(order.id, "preparing")
                          }
                        >
                          <ChefHat className="ml-1 h-4 w-4" />
                          شروع آماده‌سازی
                        </Button>
                      )}
                      {col.status === "preparing" && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleStatusChange(order.id, "ready")}
                        >
                          <CheckCircle className="ml-1 h-4 w-4" />
                          آماده شد
                        </Button>
                      )}
                      {col.status === "ready" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            handleStatusChange(order.id, "delivered")
                          }
                        >
                          تحویل داده شد
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getOrdersByStatus(col.status).length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
                  سفارشی وجود ندارد
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
