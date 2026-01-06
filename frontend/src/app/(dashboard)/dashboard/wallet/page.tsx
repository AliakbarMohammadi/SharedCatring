"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { Wallet, WalletTransaction } from "@/types";
import { toast } from "@/components/ui/toast";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function WalletPage() {
  const [topupAmount, setTopupAmount] = useState("");
  const [showTopup, setShowTopup] = useState(false);
  const queryClient = useQueryClient();

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const res = await apiClient.get("/wallets/balance");
      return res.data.data as Wallet;
    },
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      const res = await apiClient.get("/wallets/transactions");
      return res.data.data as WalletTransaction[];
    },
  });

  const topupMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiClient.post("/wallets/topup", {
        amount,
        description: "شارژ کیف پول",
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        toast("درخواست شارژ ثبت شد", "success");
        queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
        setShowTopup(false);
        setTopupAmount("");
      }
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || "خطا در شارژ کیف پول", "error");
    },
  });

  const handleTopup = () => {
    const amount = parseInt(topupAmount);
    if (isNaN(amount) || amount < 10000) {
      toast("حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است", "error");
      return;
    }
    topupMutation.mutate(amount);
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  if (walletLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">کیف پول</h1>
        <p className="text-gray-600">مدیریت موجودی و تراکنش‌ها</p>
      </div>

      {/* Balance Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-orange-100">موجودی کیف پول</p>
                <p className="text-2xl font-bold">
                  {wallet ? formatPrice(wallet.balance) : "---"}
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-white text-orange-500 hover:bg-orange-50"
              onClick={() => setShowTopup(true)}
            >
              <Plus className="ml-2 h-4 w-4" />
              شارژ کیف پول
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-green-100">یارانه سازمانی</p>
                <p className="text-2xl font-bold">
                  {wallet ? formatPrice(wallet.subsidyBalance) : "---"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-green-100">
              این مبلغ توسط سازمان شما شارژ می‌شود
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Topup Modal */}
      {showTopup && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowTopup(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">شارژ کیف پول</h2>

            <div className="mb-4">
              <Input
                label="مبلغ (تومان)"
                type="number"
                placeholder="مبلغ را وارد کنید"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
              />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopupAmount(amount.toString())}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:border-orange-500 hover:bg-orange-50"
                >
                  {formatPrice(amount)}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowTopup(false)}
              >
                انصراف
              </Button>
              <Button
                className="flex-1"
                onClick={handleTopup}
                isLoading={topupMutation.isPending}
              >
                پرداخت
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>تراکنش‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <PageLoader />
          ) : !transactions || transactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              تراکنشی ثبت نشده است
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.type === "credit"
                          ? "bg-green-100 text-green-500"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      tx.type === "credit" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {formatPrice(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
