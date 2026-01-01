'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { walletService } from '@/services/wallet.service';
import { formatPrice, toJalali, toPersianDigits } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

const topupSchema = z.object({
  amount: z.number().min(10000, 'حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است'),
});

type TopupForm = z.infer<typeof topupSchema>;

const quickAmounts = [50000, 100000, 200000, 500000];

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TopupForm>({
    resolver: zodResolver(topupSchema),
  });

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: () => walletService.getTransactions({ limit: 20 }),
  });

  // Topup mutation
  const topupMutation = useMutation({
    mutationFn: walletService.topup,
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.success('درخواست شارژ ثبت شد');
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        setShowTopupModal(false);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ثبت درخواست شارژ');
    },
  });

  const transactions = transactionsData?.data || [];

  const onTopupSubmit = (data: TopupForm) => {
    topupMutation.mutate({ amount: data.amount });
  };

  const handleQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setValue('amount', amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
      case 'credit':
        return <ArrowDownLeft className="w-5 h-5 text-success-500" />;
      case 'debit':
      case 'payment':
        return <ArrowUpRight className="w-5 h-5 text-error-500" />;
      case 'refund':
        return <ArrowDownLeft className="w-5 h-5 text-info-500" />;
      default:
        return <Wallet className="w-5 h-5 text-secondary-400" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'topup': return 'شارژ کیف پول';
      case 'credit': return 'واریز';
      case 'debit': return 'برداشت';
      case 'payment': return 'پرداخت سفارش';
      case 'refund': return 'بازگشت وجه';
      case 'company_subsidy': return 'یارانه سازمانی';
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">کیف پول</h1>
        <p className="text-secondary-500">مدیریت موجودی و تراکنش‌ها</p>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">موجودی کل</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-32 h-8 bg-white/20" />
              ) : (
                <p className="text-2xl font-bold">{formatPrice(wallet?.totalBalance || 0, false)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">موجودی شخصی</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-28 h-7" />
              ) : (
                <p className="text-xl font-bold text-secondary-800">
                  {formatPrice(wallet?.personalBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-success-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-success-600" />
            </div>
            <div>
              <p className="text-secondary-500 text-sm">یارانه سازمانی</p>
              {walletLoading ? (
                <Skeleton variant="text" className="w-28 h-7" />
              ) : (
                <p className="text-xl font-bold text-secondary-800">
                  {formatPrice(wallet?.companyBalance || 0, false)}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Topup Button */}
      <div className="mb-8">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowTopupModal(true)}
          rightIcon={<Plus className="w-5 h-5" />}
        >
          شارژ کیف پول
        </Button>
      </div>

      {/* Transactions */}
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
              description="تراکنش‌های شما در اینجا نمایش داده می‌شود"
            />
          ) : (
            <div className="space-y-4">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-4 pb-4 border-b border-secondary-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-800">{getTransactionLabel(tx.type)}</p>
                    <p className="text-sm text-secondary-500">{toJalali(tx.createdAt, 'jYYYY/jMM/jDD - HH:mm')}</p>
                    {tx.description && (
                      <p className="text-xs text-secondary-400 truncate">{tx.description}</p>
                    )}
                  </div>
                  <p className={cn(
                    'font-bold',
                    ['topup', 'credit', 'refund', 'company_subsidy'].includes(tx.type)
                      ? 'text-success-600'
                      : 'text-error-600'
                  )}>
                    {['topup', 'credit', 'refund', 'company_subsidy'].includes(tx.type) ? '+' : '-'}
                    {formatPrice(tx.amount, false)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Topup Modal */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="شارژ کیف پول"
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
