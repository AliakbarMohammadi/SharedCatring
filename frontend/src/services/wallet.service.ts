/**
 * Wallet Service - API Calls
 * سرویس کیف پول - فراخوانی API
 */

import apiClient, { ApiResponse, PaginatedResponse } from '@/lib/api/client';

// Types
export interface Wallet {
  id: string;
  userId: string;
  personalBalance: number;
  companyBalance: number;
  totalBalance: number;
  companyId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  typeLabel: string;
  balanceType: 'personal' | 'company';
  balanceTypeLabel: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface TopupRequest {
  amount: number;
  gateway?: string;
}

export interface TopupResponse {
  paymentId: string;
  paymentUrl: string;
  amount: number;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  balanceType?: string;
  fromDate?: string;
  toDate?: string;
}

// API Functions
export const walletService = {
  /**
   * Get wallet balance
   * دریافت موجودی کیف پول
   */
  async getBalance(): Promise<Wallet> {
    const response = await apiClient.get<ApiResponse<Wallet>>('/wallets/balance');
    return response.data.data;
  },

  /**
   * Get wallet transactions
   * دریافت تراکنش‌های کیف پول
   */
  async getTransactions(
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<WalletTransaction>> {
    const response = await apiClient.get<PaginatedResponse<WalletTransaction>>(
      '/wallets/transactions',
      { params: filters }
    );
    return response.data;
  },

  /**
   * Request wallet topup
   * درخواست شارژ کیف پول
   */
  async requestTopup(data: TopupRequest): Promise<TopupResponse> {
    const response = await apiClient.post<ApiResponse<TopupResponse>>(
      '/wallets/topup',
      data
    );
    return response.data.data;
  },

  /**
   * Topup wallet (alias for requestTopup)
   * شارژ کیف پول
   */
  async topup(data: TopupRequest): Promise<TopupResponse> {
    return this.requestTopup(data);
  },

  /**
   * Check balance sufficiency
   * بررسی کفایت موجودی
   */
  async checkBalance(
    amount: number,
    balanceType: 'personal' | 'company' = 'personal'
  ): Promise<{
    sufficient: boolean;
    currentBalance: number;
    requiredAmount: number;
    shortfall: number;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        sufficient: boolean;
        currentBalance: number;
        requiredAmount: number;
        shortfall: number;
      }>
    >('/wallets/check-balance', { amount, balanceType });
    return response.data.data;
  },
};

export default walletService;
