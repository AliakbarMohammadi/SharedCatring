"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { Reservation, MenuSchedule, FoodItem } from "@/types";
import { toast } from "@/components/ui/toast";
import { Calendar, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReservationsPage() {
  const queryClient = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const { data: currentReservation, isLoading: reservationLoading } = useQuery({
    queryKey: ["current-reservation"],
    queryFn: async () => {
      const res = await apiClient.get("/orders/reservations/current");
      return res.data.data as Reservation;
    },
  });

  const { data: weeklyMenu, isLoading: menuLoading } = useQuery({
    queryKey: ["weekly-menu"],
    queryFn: async () => {
      const res = await apiClient.get("/menus/weekly");
      return res.data.data as MenuSchedule[];
    },
  });

  const createReservationMutation = useMutation({
    mutationFn: async (items: any[]) => {
      const weekStart = getNextWeekStart();
      return apiClient.post("/orders/reservations", {
        weekStartDate: weekStart,
        items,
      });
    },
    onSuccess: () => {
      toast("رزرو با موفقیت ثبت شد", "success");
      queryClient.invalidateQueries({ queryKey: ["current-reservation"] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در ثبت رزرو", "error");
    },
  });

  const getNextWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    return nextSaturday.toISOString().split("T")[0];
  };

  const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];

  if (reservationLoading || menuLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">رزرو هفتگی</h1>
        <p className="text-gray-600">رزرو غذای هفته آینده</p>
      </div>

      {/* Current Reservation */}
      {currentReservation && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              رزرو فعال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentReservation.items.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <p className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString("fa-IR")}
                  </p>
                  <p className="font-medium text-gray-900">{item.foodId}</p>
                  <Badge variant="secondary">{item.mealType}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Menu */}
      <Card>
        <CardHeader>
          <CardTitle>برنامه غذایی هفته آینده</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyMenu && weeklyMenu.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {weeklyMenu.map((schedule, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {new Date(schedule.date).toLocaleDateString("fa-IR", {
                        weekday: "long",
                      })}
                    </span>
                    <Badge>{schedule.mealType === "lunch" ? "ناهار" : "شام"}</Badge>
                  </div>
                  <div className="space-y-2">
                    {schedule.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                      >
                        <span className="text-sm text-gray-700">
                          {item.food?.name || "غذا"}
                        </span>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              برنامه غذایی هفته آینده هنوز منتشر نشده است
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
