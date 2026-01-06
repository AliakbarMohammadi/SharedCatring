"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { Order } from "@/types";
import { Eye, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/orders");
      return res.data.data as Order[];
    },
  });

  const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
    pending: { label: "در انتظار", variant: "warning" },
    confirmed: { label: "تایید شده", variant: "default" },
    preparing: { label: "در حال آماده‌سازی", variant: "default" },
    ready: { label: "آماده تحویل", variant: "success" },
    delivered: { label: "تحویل داده شده", variant: "success" },
    cancelled: { label: "لغو شده", variant: "destructive" },
  };

  const handleReorder = async (orderId: string) => {
    try {
      await apiClient.post(`/orders/${orderId}/reorder`);
      toast("سفارش مجدد ثبت شد", "success");
      refetch();
    } catch (error: any) {
      toast(error.response?.data?.message || "خطا در ثبت سفارش مجدد", "error");
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">سفارش‌های من</h1>
        <p className="text-gray-600">لیست تمام سفارش‌های شما</p>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">سفارشی ثبت نشده است</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        سفارش #{order.orderNumber}
                      </h3>
                      <Badge variant={statusLabels[order.status]?.variant}>
                        {statusLabels[order.status]?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      تاریخ تحویل: {new Date(order.deliveryDate).toLocaleDateString("fa-IR")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} آیتم
                    </p>
                  </div>

                  <div className="text-left">
                    <p className="text-lg font-bold text-orange-500">
                      {formatPrice(order.total)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="ml-1 h-4 w-4" />
                        جزئیات
                      </Button>
                      {order.status === "delivered" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(order.id)}
                        >
                          <RotateCcw className="ml-1 h-4 w-4" />
                          سفارش مجدد
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                    >
                      {item.foodName} × {item.quantity}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                      +{order.items.length - 3} مورد دیگر
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          جزئیات سفارش #{order.orderNumber}
        </h2>

        <div className="mb-4 space-y-3">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
            >
              <div>
                <p className="font-medium text-gray-900">{item.foodName}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} عدد × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="font-medium text-gray-900">
                {formatPrice(item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">جمع کل:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">تخفیف:</span>
              <span className="text-green-500">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">مالیات:</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>مبلغ نهایی:</span>
            <span className="text-orange-500">{formatPrice(order.total)}</span>
          </div>
        </div>

        {order.deliveryAddress && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">آدرس تحویل:</p>
            <p className="text-sm text-gray-600">{order.deliveryAddress.address}</p>
          </div>
        )}

        <Button className="mt-6 w-full" onClick={onClose}>
          بستن
        </Button>
      </div>
    </>
  );
}
