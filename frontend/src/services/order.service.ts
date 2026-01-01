/**
 * Order Service - API Calls
 * سرویس سفارش - فراخوانی API
 */

import apiClient, { ApiResponse, PaginatedResponse } from '@/lib/api/client';

// Types
export interface OrderItem {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  companyId?: string;
  orderType: 'personal' | 'corporate';
  status: string;
  statusLabel: string;
  subtotal: number;
  discountAmount: number;
  discount?: number;
  subsidyAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  userPayable: number;
  companyPayable: number;
  deliveryDate: string;
  deliveryTimeSlot?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  promoCode?: string;
  notes?: string;
  items: OrderItem[];
  statusHistory?: Array<{
    status: string;
    statusLabel: string;
    changedBy: string;
    notes?: string;
    createdAt: string;
  }>;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  companyId?: string;
  orderType?: 'personal' | 'corporate';
  items: Array<{
    foodId: string;
    foodName?: string;
    quantity: number;
    unitPrice?: number;
    notes?: string;
  }>;
  deliveryDate: string;
  deliveryTimeSlot?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  promoCode?: string;
  notes?: string;
  fromCart?: boolean;
  paymentMethod?: string;
}

// Alias for CreateOrderRequest
export type CreateOrderData = CreateOrderRequest;

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  orderType?: string;
  fromDate?: string;
  toDate?: string;
}

// API Functions
export const orderService = {
  /**
   * Create new order
   * ایجاد سفارش جدید
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },

  /**
   * Get user orders
   * دریافت سفارشات کاربر
   */
  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get order by ID
   * دریافت سفارش با شناسه
   */
  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  /**
   * Get order by order number
   * دریافت سفارش با شماره سفارش
   */
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(
      `/orders/number/${orderNumber}`
    );
    return response.data.data;
  },

  /**
   * Cancel order
   * لغو سفارش
   */
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`, {
      reason,
    });
    return response.data.data;
  },

  /**
   * Reorder (create new order from existing)
   * سفارش مجدد
   */
  async reorder(orderId: string): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/reorder`);
    return response.data.data;
  },

  /**
   * Track order status
   * پیگیری وضعیت سفارش
   */
  async trackOrder(orderNumber: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(
      `/orders/track/${orderNumber}`
    );
    return response.data.data;
  },

  /**
   * Get today's orders (for kitchen)
   * دریافت سفارشات امروز (برای آشپزخانه)
   */
  async getTodayOrders(): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/today');
    return response.data.data;
  },

  /**
   * Update order status (admin)
   * تغییر وضعیت سفارش (مدیر)
   */
  async updateOrderStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, {
      status,
      notes,
    });
    return response.data.data;
  },
};

export default orderService;
