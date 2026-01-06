"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import { toast } from "@/components/ui/toast";
import { Wallet } from "@/types";
import { ArrowRight, MapPin, CreditCard, Wallet as WalletIcon, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Step = "review" | "delivery" | "payment";
type PaymentMethod = "wallet" | "gateway";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<Step>("review");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");

  const { data: wallet } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const res = await apiClient.get("/wallets/balance");
      return res.data.data as Wallet;
    },
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = {
        orderType: user?.companyId ? "corporate" : "personal",
        items: items.map((item) => ({
          foodId: item.foodId,
          foodName: item.foodName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        deliveryDate: new Date().toISOString().split("T")[0],
        deliveryAddress: { address: deliveryAddress },
      };

      const orderRes = await apiClient.post("/orders", orderData);
      const orderId = orderRes.data.data.id;

      if (paymentMethod === "gateway") {
        const paymentRes = await apiClient.post("/payments/request", {
          orderId,
          amount: getTotal(),
          gateway: "zarinpal",
          description: "پرداخت سفارش",
        });
        return { orderId, paymentUrl: paymentRes.data.data.paymentUrl };
      }

      return { orderId };
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        clearCart();
        toast("سفارش با موفقیت ثبت شد", "success");
        router.push("/dashboard/orders");
      }
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در ثبت سفارش", "error");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="mb-4 text-xl font-bold">برای ادامه وارد شوید</h2>
              <p className="mb-6 text-gray-600">
                برای تکمیل سفارش باید وارد حساب کاربری خود شوید
              </p>
              <Link href="/auth/login">
                <Button className="w-full">ورود به حساب</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="mb-4 text-xl font-bold">سبد خرید خالی است</h2>
              <Link href="/menu">
                <Button>مشاهده منو</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const steps = [
    { id: "review", label: "بررسی سفارش" },
    { id: "delivery", label: "آدرس تحویل" },
    { id: "payment", label: "پرداخت" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Steps */}
          <div className="mb-8 flex items-center justify-center gap-4">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    step === s.id
                      ? "bg-orange-500 text-white"
                      : steps.findIndex((x) => x.id === step) > idx
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {steps.findIndex((x) => x.id === step) > idx ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    step === s.id ? "font-medium text-gray-900" : "text-gray-500"
                  )}
                >
                  {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className="mx-2 h-px w-8 bg-gray-300" />
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {step === "review" && (
                <Card>
                  <CardHeader>
                    <CardTitle>بررسی سفارش</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.foodName}
                            </p>
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
                    <Button
                      className="mt-6 w-full"
                      onClick={() => setStep("delivery")}
                    >
                      ادامه
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step === "delivery" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      آدرس تحویل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      label="آدرس کامل"
                      placeholder="تهران، خیابان..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep("review")}
                      >
                        <ArrowRight className="ml-2 h-4 w-4" />
                        بازگشت
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setStep("payment")}
                        disabled={!deliveryAddress}
                      >
                        ادامه
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle>روش پرداخت</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-4 rounded-lg border p-4",
                          paymentMethod === "wallet"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "wallet"}
                          onChange={() => setPaymentMethod("wallet")}
                          className="text-orange-500"
                        />
                        <WalletIcon className="h-6 w-6 text-gray-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">کیف پول</p>
                          <p className="text-sm text-gray-500">
                            موجودی: {wallet ? formatPrice(wallet.balance + wallet.subsidyBalance) : "---"}
                          </p>
                        </div>
                      </label>

                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-4 rounded-lg border p-4",
                          paymentMethod === "gateway"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "gateway"}
                          onChange={() => setPaymentMethod("gateway")}
                          className="text-orange-500"
                        />
                        <CreditCard className="h-6 w-6 text-gray-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            درگاه پرداخت
                          </p>
                          <p className="text-sm text-gray-500">
                            پرداخت آنلاین با کارت بانکی
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep("delivery")}
                      >
                        <ArrowRight className="ml-2 h-4 w-4" />
                        بازگشت
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => createOrderMutation.mutate()}
                        isLoading={createOrderMutation.isPending}
                      >
                        ثبت سفارش
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>خلاصه سفارش</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">تعداد آیتم‌ها:</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">جمع کل:</span>
                      <span>{formatPrice(getTotal())}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-bold">
                        <span>مبلغ قابل پرداخت:</span>
                        <span className="text-orange-500">
                          {formatPrice(getTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
