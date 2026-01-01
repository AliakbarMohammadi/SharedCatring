/**
 * Admin Service - API Calls
 * سرویس مدیریت - فراخوانی API
 */

import apiClient, { ApiResponse, PaginatedResponse } from '@/lib/api/client';

// Types
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeUsers: number;
  activeCompanies: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  pendingOrders: number;
  pendingCompanies: number;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  role: string;
  isActive: boolean;
  companyId?: string;
  companyName?: string;
  createdAt: string;
}

export interface AdminCompany {
  id: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  employeeCount: number;
  walletBalance: number;
  createdAt: string;
}

// API Functions
export const adminService = {
  /**
   * Get dashboard stats
   * دریافت آمار داشبورد
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/admin/stats');
    return response.data.data;
  },

  /**
   * Get all orders
   * دریافت همه سفارشات
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    companyId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>('/admin/orders', { params });
    return response.data;
  },

  /**
   * Update order status
   * به‌روزرسانی وضعیت سفارش
   */
  async updateOrderStatus(orderId: string, status: string, reason?: string): Promise<any> {
    const response = await apiClient.put<ApiResponse<any>>(`/admin/orders/${orderId}/status`, { status, reason });
    return response.data.data;
  },

  /**
   * Get all users
   * دریافت همه کاربران
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<AdminUser>> {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   * دریافت کاربر با شناسه
   */
  async getUserById(id: string): Promise<AdminUser> {
    const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${id}`);
    return response.data.data;
  },

  /**
   * Update user
   * به‌روزرسانی کاربر
   */
  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    const response = await apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Toggle user status
   * تغییر وضعیت کاربر
   */
  async toggleUserStatus(id: string): Promise<AdminUser> {
    const response = await apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}/toggle-status`);
    return response.data.data;
  },

  /**
   * Get all companies
   * دریافت همه شرکت‌ها
   */
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<AdminCompany>> {
    const response = await apiClient.get<PaginatedResponse<AdminCompany>>('/admin/companies', { params });
    return response.data;
  },

  /**
   * Get company by ID
   * دریافت شرکت با شناسه
   */
  async getCompanyById(id: string): Promise<AdminCompany> {
    const response = await apiClient.get<ApiResponse<AdminCompany>>(`/admin/companies/${id}`);
    return response.data.data;
  },

  /**
   * Approve company
   * تأیید شرکت
   */
  async approveCompany(id: string): Promise<AdminCompany> {
    const response = await apiClient.put<ApiResponse<AdminCompany>>(`/admin/companies/${id}/approve`);
    return response.data.data;
  },

  /**
   * Reject company
   * رد شرکت
   */
  async rejectCompany(id: string, reason: string): Promise<AdminCompany> {
    const response = await apiClient.put<ApiResponse<AdminCompany>>(`/admin/companies/${id}/reject`, { reason });
    return response.data.data;
  },

  /**
   * Get reports
   * دریافت گزارشات
   */
  async getReports(params: {
    type: 'revenue' | 'orders' | 'users' | 'companies';
    period: 'daily' | 'weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/admin/reports', { params });
    return response.data.data;
  },

  /**
   * Export report
   * خروجی گزارش
   */
  async exportReport(params: {
    type: string;
    format: 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await apiClient.get('/admin/reports/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get menu categories (admin)
   * دریافت دسته‌بندی‌های منو (مدیر)
   */
  async getCategories(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/admin/menu/categories');
    return response.data.data;
  },

  /**
   * Create category
   * ایجاد دسته‌بندی
   */
  async createCategory(data: { name: string; description?: string; image?: string }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/admin/menu/categories', data);
    return response.data.data;
  },

  /**
   * Update category
   * به‌روزرسانی دسته‌بندی
   */
  async updateCategory(id: string, data: Partial<any>): Promise<any> {
    const response = await apiClient.put<ApiResponse<any>>(`/admin/menu/categories/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete category
   * حذف دسته‌بندی
   */
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/admin/menu/categories/${id}`);
  },

  /**
   * Get foods (admin)
   * دریافت غذاها (مدیر)
   */
  async getFoods(params?: { page?: number; limit?: number; categoryId?: string }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>('/admin/menu/foods', { params });
    return response.data;
  },

  /**
   * Create food
   * ایجاد غذا
   */
  async createFood(data: any): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/admin/menu/foods', data);
    return response.data.data;
  },

  /**
   * Update food
   * به‌روزرسانی غذا
   */
  async updateFood(id: string, data: Partial<any>): Promise<any> {
    const response = await apiClient.put<ApiResponse<any>>(`/admin/menu/foods/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete food
   * حذف غذا
   */
  async deleteFood(id: string): Promise<void> {
    await apiClient.delete(`/admin/menu/foods/${id}`);
  },

  /**
   * Publish daily menu
   * انتشار منوی روزانه
   */
  async publishDailyMenu(data: { date: string; items: { foodId: string; maxQuantity?: number }[] }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/admin/menu/daily', data);
    return response.data.data;
  },
};

export default adminService;
