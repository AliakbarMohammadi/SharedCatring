/**
 * Kitchen Service - API Calls
 * سرویس آشپزخانه - فراخوانی API
 */

import apiClient, { ApiResponse } from '@/lib/api/client';

// Types
export interface KitchenOrderItem {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userName?: string;
  companyName?: string;
  items: KitchenOrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  deliveryDate: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailySummaryItem {
  foodId: string;
  foodName: string;
  category?: string;
  totalQuantity: number;
  totalOrders: number;
}

export interface KitchenStats {
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
  totalToday: number;
}

// API Functions
export const kitchenService = {
  /**
   * Get kitchen queue orders
   * دریافت سفارشات صف آشپزخانه
   */
  async getQueue(params?: { status?: string; date?: string }): Promise<KitchenOrder[]> {
    const response = await apiClient.get<ApiResponse<KitchenOrder[]>>(
      '/orders/kitchen/queue',
      { params }
    );
    return response.data.data;
  },

  /**
   * Update order status
   * به‌روزرسانی وضعیت سفارش
   */
  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'preparing' | 'ready' | 'delivered'
  ): Promise<KitchenOrder> {
    const response = await apiClient.patch<ApiResponse<KitchenOrder>>(
      `/orders/${orderId}/status`,
      { status }
    );
    return response.data.data;
  },

  /**
   * Get daily summary
   * دریافت خلاصه روزانه
   */
  async getDailySummary(date?: string): Promise<DailySummaryItem[]> {
    const response = await apiClient.get<ApiResponse<DailySummaryItem[]>>(
      '/orders/kitchen/summary',
      { params: { date } }
    );
    return response.data.data;
  },

  /**
   * Get kitchen statistics
   * دریافت آمار آشپزخانه
   */
  async getStats(date?: string): Promise<KitchenStats> {
    const response = await apiClient.get<ApiResponse<KitchenStats>>(
      '/orders/kitchen/stats',
      { params: { date } }
    );
    return response.data.data;
  },
};

export default kitchenService;
