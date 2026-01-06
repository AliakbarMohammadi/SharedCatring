"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { Invoice } from "@/types";
import { Download, Eye } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["my-invoices"],
    queryFn: async () => {
      const res = await apiClient.get("/invoices");
      return res.data.data as Invoice[];
    },
  });

  const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
    draft: { label: "پیش‌نویس", variant: "secondary" },
    issued: { label: "صادر شده", variant: "warning" },
    paid: { label: "پرداخت شده", variant: "success" },
    cancelled: { label: "لغو شده", variant: "destructive" },
  };

  const handleDownload = async (invoiceId: string) => {
    try {
      const res = await apiClient.get(`/invoices/${invoiceId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast("خطا در دانلود فاکتور", "error");
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">فاکتورها</h1>
        <p className="text-gray-600">لیست فاکتورهای شما</p>
      </div>

      {!invoices || invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">فاکتوری ثبت نشده است</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        فاکتور #{invoice.invoiceNumber}
                      </h3>
                      <Badge variant={statusLabels[invoice.status]?.variant}>
                        {statusLabels[invoice.status]?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      تاریخ: {new Date(invoice.createdAt).toLocaleDateString("fa-IR")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {invoice.items.length} آیتم
                    </p>
                  </div>

                  <div className="text-left">
                    <p className="text-lg font-bold text-orange-500">
                      {formatPrice(invoice.total)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(invoice.id)}
                      >
                        <Download className="ml-1 h-4 w-4" />
                        دانلود PDF
                      </Button>
                    </div>
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
