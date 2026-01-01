/**
 * Payment Service - API Calls
 * سرویس پرداخت - فراخوانی API
 */

import apiClient, { ApiResponse, PaginatedResponse } from '@/lib/api/client';

// Types
export interface Payment {
  id: string;
  orderId?: string;
  userId: string;
  amount: number;
  gateway: string;
  status: string;
  statusLabel: string;
  authority?: string;
  refId?: string;
  cardPan?: string;
  description?: string;
  paymentUrl?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  orderId?: string;
  amount: number;
  gateway?: string;
  description?: string;
  callbackUrl?: string;
}

export interface PaymentVerifyRequest {
  paymentId: string;
  authority: string;
  status: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  gateway?: string;
  fromDate?: string;
  toDate?: string;
}

// API Functions
export const paymentService = {
  /**
   * Create payment request
   * ایجاد درخواست پرداخت
   */
  async createPayment(data: PaymentRequest): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>(
      '/payments/request',
      data
    );
    return response.data.data;
  },

  /**
   * Verify payment
   * تأیید پرداخت
   */
  async verifyPayment(data: PaymentVerifyRequest): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>(
      '/payments/verify',
      data
    );
    return response.data.data;
  },

  /**
   * Get payment by ID
   * دریافت پرداخت با شناسه
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  /**
   * Get user payments
   * دریافت پرداخت‌های کاربر
   */
  async getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/payments', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get available gateways
   * دریافت درگاه‌های موجود
   */
  async getGateways(): Promise<Array<{ id: string; name: string; icon?: string }>> {
    const response = await apiClient.get<
      ApiResponse<Array<{ id: string; name: string; icon?: string }>>
    >('/payments/gateways');
    return response.data.data;
  },
};

export default paymentService;
