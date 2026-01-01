/**
 * Notification Service - API Calls
 * سرویس اعلان‌ها - فراخوانی API
 */

import apiClient, { ApiResponse, PaginatedResponse } from '@/lib/api/client';

// Types
export interface Notification {
  id: string;
  userId: string;
  type: 'in_app' | 'email' | 'sms' | 'push';
  typeLabel: string;
  category: string;
  categoryLabel: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  status: 'pending' | 'sent' | 'read' | 'failed';
  statusLabel: string;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    address?: string;
  };
  sms: {
    enabled: boolean;
    phone?: string;
  };
  push: {
    enabled: boolean;
  };
  categories: {
    order: boolean;
    payment: boolean;
    wallet: boolean;
    company: boolean;
    system: boolean;
  };
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  category?: string;
}

// API Functions
export const notificationService = {
  /**
   * Get user notifications
   * دریافت اعلان‌های کاربر
   */
  async getNotifications(
    filters?: NotificationFilters
  ): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      '/notifications',
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get unread count
   * دریافت تعداد خوانده نشده
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  /**
   * Mark notification as read
   * علامت‌گذاری اعلان به عنوان خوانده شده
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return response.data.data;
  },

  /**
   * Mark all as read
   * علامت‌گذاری همه به عنوان خوانده شده
   */
  async markAllAsRead(): Promise<{ modifiedCount: number }> {
    const response = await apiClient.post<ApiResponse<{ modifiedCount: number }>>(
      '/notifications/read-all'
    );
    return response.data.data;
  },

  /**
   * Get notification preferences
   * دریافت تنظیمات اعلان‌ها
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences'
    );
    return response.data.data;
  },

  /**
   * Update notification preferences
   * به‌روزرسانی تنظیمات اعلان‌ها
   */
  async updatePreferences(
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const response = await apiClient.patch<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
      updates
    );
    return response.data.data;
  },

  /**
   * Delete notification
   * حذف اعلان
   */
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};

export default notificationService;
