'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/auth.store';
import { companyService } from '@/services/company.service';
import { walletService } from '@/services/wallet.service';
import { formatPrice, toJalali, toPersianDigits } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

const topupSchema = z.object({
  amount: z.number().min(100000, 'حداقل مبلغ شارژ ۱۰۰,۰۰۰ تومان است'),
});

type TopupForm = z.infer<typeof topupSchema>;

const quickAmounts = [500000, 1000000, 2000000, 5000000];

export default function CompanyWalletPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const companyId = user?.companyId;

  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'invoices'>('transactions');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TopupForm>({
    resolver: zodResolver(topupSchema),
  });

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
  });

  // Fetch company transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['company', companyId, 'wallet', 'transactions'],
    queryFn: () => companyService.getCompanyWalletTransactions(companyId!, { limit: 20 }),
    enabled: !!companyId,
  });

  // Fetch company invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['company', companyId, 'invoices'],
    queryFn: () => companyService.getCompanyInvoices(companyId!, { limit: 20 }),
    enabled: !!companyId,
  });

  // Topup mutation
  const topupMutation = useMutation({
    mutationFn: (amount: number) =>
      companyService.topupCompanyWallet(companyId!, { amount }),
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.success('درخواست شارژ ثبت شد');
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['company', companyId, 'wallet'] });
        setShowTopupModal(false);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ثبت درخواست شارژ');
    },
  });

  const transactions = transactionsData?.data || [];
  const invoices = invoicesData?.data || [];

  const onTopupSubmit = (data: TopupForm) => {
    topupMutation.mutate(data.amount);
  };

  const handleQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setValue('amount', amount);
  };

  const getTransactionIcon = (type: string) => {
    if (type.includes('credit') || type.includes('topup') || type.includes('refund')) {
      return <ArrowDownLeft className="w-5 h-5 text-success-500" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-error-500" />;
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" size="sm">پرداخت شده</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">در انتظار پرداخت</Badge>;
      case 'cancelled':
        return <Badge variant="default" size="sm">لغو شده</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">کیف پول شرکت</h1>
        <p className="text-secondary-500">مدیریت موجودی و تراکنش‌های مالی شرکت</p>
      </div>

      {/* Balance Card */}
      <Card
        variant="elevated"
        padding="lg"
        className="bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">موجودی کیف پول شرکت</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-48 h-10 bg-white/20" />
              ) : (
                <p className="text-3xl font-bold">{formatPrice(wallet?.companyBalance || 0, false)}</p>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowTopupModal(true)}
            rightIcon={<Plus className="w-5 h-5" />}
            className="bg-white text-primary-600 hover:bg-primary-50"
          >
            شارژ کیف پول
          </Button>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">کل واریزی‌ها</p>
              {transactionsLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {formatPrice(
                    transactions
                      .filter((tx: any) => tx.type.includes('credit') || tx.type.includes('topup'))
                      .reduce((sum: number, tx: any) => sum + tx.amount, 0),
                    false
                  )}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-error-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">کل برداشت‌ها</p>
              {transactionsLoading ? (
                <Skeleton variant="text" className="w-24 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {formatPrice(
                    transactions
                      .filter((tx: any) => tx.type.includes('debit') || tx.type.includes('payment'))
                      .reduce((sum: number, tx: any) => sum + tx.amount, 0),
                    false
                  )}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">فاکتورهای باز</p>
              {invoicesLoading ? (
                <Skeleton variant="text" className="w-16 h-6" />
              ) : (
                <p className="text-lg font-bold text-secondary-800">
                  {toPersianDigits(invoices.filter((inv: any) => inv.status === 'pending').length)}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-secondary-200">
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            'px-4 py-2 font-medium transition-colors border-b-2',
            activeTab === 'transactions'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          )}
        >
          تراکنش‌ها
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={cn(
            'px-4 py-2 font-medium transition-colors border-b-2',
            activeTab === 'invoices'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          )}
        >
          فاکتورها
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card variant="elevated" padding="lg">
          <CardHeader title="تراکنش‌های اخیر" />
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton variant="circular" className="w-10 h-10" />
                    <div className="flex-1">
                      <Skeleton variant="text" className="w-24 h-4 mb-1" />
                      <Skeleton variant="text" className="w-32 h-3" />
                    </div>
                    <Skeleton variant="text" className="w-20 h-5" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState
                icon={<Wallet className="w-12 h-12" />}
                title="تراکنشی وجود ندارد"
                description="تراکنش‌های شرکت در اینجا نمایش داده می‌شود"
              />
            ) : (
              <div className="space-y-4">
                {transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 pb-4 border-b border-secondary-100 last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-800">{tx.typeLabel || tx.type}</p>
                      <p className="text-sm text-secondary-500">
                        {toJalali(tx.createdAt, 'jYYYY/jMM/jDD - HH:mm')}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-secondary-400 truncate">{tx.description}</p>
                      )}
                    </div>
                    <div className="text-left">
                      <p
                        className={cn(
                          'font-bold',
                          tx.type.includes('credit') || tx.type.includes('topup') || tx.type.includes('refund')
                            ? 'text-success-600'
                            : 'text-error-600'
                        )}
                      >
                        {tx.type.includes('credit') || tx.type.includes('topup') || tx.type.includes('refund')
                          ? '+'
                          : '-'}
                        {formatPrice(tx.amount, false)}
                      </p>
                      <p className="text-xs text-secondary-500">
                        موجودی: {formatPrice(tx.balanceAfter, false)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card variant="elevated" padding="lg">
          <CardHeader title="فاکتورهای شرکت" />
          <CardContent>
            {invoicesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton variant="circular" className="w-10 h-10" />
                    <div className="flex-1">
                      <Skeleton variant="text" className="w-32 h-4 mb-1" />
                      <Skeleton variant="text" className="w-24 h-3" />
                    </div>
                    <Skeleton variant="rectangular" className="w-20 h-6 rounded" />
                  </div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-12 h-12" />}
                title="فاکتوری وجود ندارد"
                description="فاکتورهای شرکت در اینجا نمایش داده می‌شود"
              />
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice: any) => (
                  <div
                    key={invoice.id}
                    className="flex items-center gap-4 pb-4 border-b border-secondary-100 last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-800">
                        فاکتور #{invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {toJalali(invoice.createdAt, 'jYYYY/jMM/jDD')}
                      </p>
                      {invoice.description && (
                        <p className="text-xs text-secondary-400 truncate">{invoice.description}</p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-secondary-800 mb-1">
                        {formatPrice(invoice.amount, false)}
                      </p>
                      {getInvoiceStatusBadge(invoice.status)}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Topup Modal */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="شارژ کیف پول شرکت"
      >
        <form onSubmit={handleSubmit(onTopupSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-secondary-700 mb-3 block">مبلغ پیشنهادی</label>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickAmount(amount)}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-colors',
                    selectedAmount === amount
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-primary-300'
                  )}
                >
                  {formatPrice(amount)}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="مبلغ دلخواه (تومان)"
            type="number"
            placeholder="مبلغ را وارد کنید"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
            onChange={(e) => {
              setSelectedAmount(null);
              register('amount').onChange(e);
            }}
          />

          <div className="bg-info-50 border border-info-200 rounded-lg p-4">
            <p className="text-sm text-info-800">
              پس از تایید، به درگاه پرداخت منتقل می‌شوید. پس از پرداخت موفق، موجودی شرکت به‌روزرسانی خواهد شد.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowTopupModal(false)}>
              انصراف
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={topupMutation.isPending}>
              پرداخت و شارژ
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
