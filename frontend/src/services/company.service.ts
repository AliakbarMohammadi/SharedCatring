/**
 * Company Service - API Calls
 * سرویس شرکت - فراخوانی API
 */

import apiClient, { ApiResponse, PaginatedResponse } from '@/lib/api/client';

// Types
export interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  settings?: CompanySettings;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  position?: string;
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  companyId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface CompanyStats {
  employeeCount: number;
  activeEmployees: number;
  totalOrders: number;
  monthlyOrders: number;
  totalSpent: number;
  monthlySpent: number;
  walletBalance: number;
  subsidyUsed: number;
  subsidyRemaining: number;
}

export interface DailyOrdersChart {
  date: string;
  orders: number;
  amount: number;
}

export interface CompanySettings {
  subsidyEnabled: boolean;
  subsidyType: 'percentage' | 'fixed' | 'tiered';
  subsidyValue: number;
  maxSubsidyPerDay?: number;
  maxSubsidyPerMonth?: number;
  allowedCategories?: string[];
  orderDeadline?: string;
  deliveryTimeSlots?: string[];
}

export interface SubsidyCalculation {
  originalPrice: number;
  subsidyAmount: number;
  companyShare: number;
  userShare: number;
  subsidyPercentage: number;
  dailyLimitRemaining: number;
  monthlyLimitRemaining: number;
}

export interface EmployeeSubsidyInfo {
  dailyLimit: number;
  monthlyLimit: number;
  usedToday: number;
  usedThisMonth: number;
  remainingToday: number;
  remainingThisMonth: number;
}

export interface Reservation {
  id: string;
  userId: string;
  companyId: string;
  date: string;
  items: Array<{
    foodId: string;
    foodName: string;
    quantity: number;
    originalPrice: number;
    subsidyAmount: number;
    userPayable: number;
  }>;
  totalOriginalPrice: number;
  totalSubsidy: number;
  totalUserPayable: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface SubsidyRule {
  id: string;
  companyId: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  maxAmount?: number;
  minOrderAmount?: number;
  mealTypes?: string[];
  categories?: string[];
  isActive: boolean;
  priority: number;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubsidyRuleRequest {
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  maxAmount?: number;
  minOrderAmount?: number;
  mealTypes?: string[];
  categories?: string[];
  isActive?: boolean;
  priority?: number;
  validFrom?: string;
  validTo?: string;
}

export interface CompanyInvoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  type: 'topup' | 'subsidy' | 'order';
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate?: string;
  paidAt?: string;
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyWalletTransaction {
  id: string;
  companyId: string;
  type: string;
  typeLabel: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface CreateReservationRequest {
  date: string;
  items: Array<{
    foodId: string;
    quantity: number;
  }>;
}

// API Functions
export const companyService = {
  /**
   * Get company details
   * دریافت اطلاعات شرکت
   */
  async getCompany(id: string): Promise<Company> {
    const response = await apiClient.get<ApiResponse<Company>>(`/companies/${id}`);
    return response.data.data;
  },

  /**
   * Get current user's company
   * دریافت شرکت کاربر جاری
   */
  async getMyCompany(): Promise<Company> {
    const response = await apiClient.get<ApiResponse<Company>>('/companies/my-company');
    return response.data.data;
  },

  /**
   * Calculate subsidy for items
   * محاسبه یارانه برای آیتم‌ها
   */
  async calculateSubsidy(
    companyId: string,
    items: Array<{ foodId: string; quantity: number; price: number }>
  ): Promise<SubsidyCalculation> {
    const response = await apiClient.post<ApiResponse<SubsidyCalculation>>(
      `/companies/${companyId}/subsidy/calculate`,
      { items }
    );
    return response.data.data;
  },

  /**
   * Get employee subsidy information
   * دریافت اطلاعات یارانه کارمند
   */
  async getEmployeeSubsidyInfo(): Promise<EmployeeSubsidyInfo> {
    const response = await apiClient.get<ApiResponse<EmployeeSubsidyInfo>>(
      '/companies/my-company/subsidy/info'
    );
    return response.data.data;
  },

  /**
   * Get weekly reservations
   * دریافت رزروهای هفتگی
   */
  async getWeeklyReservations(startDate: string): Promise<Reservation[]> {
    const response = await apiClient.get<ApiResponse<Reservation[]>>(
      '/orders/reservations',
      { params: { startDate, type: 'weekly' } }
    );
    return response.data.data;
  },

  /**
   * Create reservation
   * ایجاد رزرو
   */
  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    const response = await apiClient.post<ApiResponse<Reservation>>(
      '/orders/reservations',
      data
    );
    return response.data.data;
  },

  /**
   * Update reservation
   * به‌روزرسانی رزرو
   */
  async updateReservation(
    id: string,
    data: Partial<CreateReservationRequest>
  ): Promise<Reservation> {
    const response = await apiClient.patch<ApiResponse<Reservation>>(
      `/orders/reservations/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Cancel reservation
   * لغو رزرو
   */
  async cancelReservation(id: string): Promise<void> {
    await apiClient.delete(`/orders/reservations/${id}`);
  },

  /**
   * Get company employees (admin only)
   * دریافت کارمندان شرکت (فقط مدیر)
   */
  async getEmployees(
    companyId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<PaginatedResponse<Employee>> {
    const response = await apiClient.get<PaginatedResponse<Employee>>(
      `/companies/${companyId}/employees`,
      { params }
    );
    return response.data;
  },

  /**
   * Add employee to company (admin only)
   * افزودن کارمند به شرکت (فقط مدیر)
   */
  async addEmployee(companyId: string, data: { userId?: string; email?: string }): Promise<void> {
    await apiClient.post(`/companies/${companyId}/employees`, data);
  },

  /**
   * Remove employee from company (admin only)
   * حذف کارمند از شرکت (فقط مدیر)
   */
  async removeEmployee(companyId: string, userId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/employees/${userId}`);
  },

  /**
   * Update employee (admin only)
   * به‌روزرسانی کارمند (فقط مدیر)
   */
  async updateEmployee(
    companyId: string,
    userId: string,
    data: Partial<Employee>
  ): Promise<Employee> {
    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/companies/${companyId}/employees/${userId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Bulk import employees (admin only)
   * وارد کردن دسته‌جمعی کارمندان (فقط مدیر)
   */
  async bulkImportEmployees(companyId: string, file: File): Promise<{ success: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ success: number; failed: number }>>(
      `/companies/${companyId}/employees/bulk`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  },

  /**
   * Get join requests (admin only)
   * دریافت درخواست‌های عضویت (فقط مدیر)
   */
  async getJoinRequests(
    companyId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<PaginatedResponse<JoinRequest>> {
    const response = await apiClient.get<PaginatedResponse<JoinRequest>>(
      `/companies/${companyId}/join-requests`,
      { params }
    );
    return response.data;
  },

  /**
   * Update join request status (admin only)
   * به‌روزرسانی وضعیت درخواست عضویت (فقط مدیر)
   */
  async updateJoinRequestStatus(
    companyId: string,
    requestId: string,
    status: 'approved' | 'rejected'
  ): Promise<JoinRequest> {
    const response = await apiClient.patch<ApiResponse<JoinRequest>>(
      `/companies/${companyId}/join-requests/${requestId}/status`,
      { status }
    );
    return response.data.data;
  },

  /**
   * Get company statistics (admin only)
   * دریافت آمار شرکت (فقط مدیر)
   */
  async getCompanyStats(companyId: string): Promise<CompanyStats> {
    const response = await apiClient.get<ApiResponse<CompanyStats>>(
      `/companies/${companyId}/stats`
    );
    return response.data.data;
  },

  /**
   * Get daily orders chart data (admin only)
   * دریافت داده‌های نمودار سفارشات روزانه (فقط مدیر)
   */
  async getDailyOrdersChart(
    companyId: string,
    params?: { fromDate?: string; toDate?: string }
  ): Promise<DailyOrdersChart[]> {
    const response = await apiClient.get<ApiResponse<DailyOrdersChart[]>>(
      `/companies/${companyId}/charts/daily-orders`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get subsidy rules (admin only)
   * دریافت قوانین یارانه (فقط مدیر)
   */
  async getSubsidyRules(companyId: string): Promise<SubsidyRule[]> {
    const response = await apiClient.get<ApiResponse<SubsidyRule[]>>(
      `/companies/${companyId}/subsidy-rules`
    );
    return response.data.data;
  },

  /**
   * Create subsidy rule (admin only)
   * ایجاد قانون یارانه (فقط مدیر)
   */
  async createSubsidyRule(
    companyId: string,
    data: CreateSubsidyRuleRequest
  ): Promise<SubsidyRule> {
    const response = await apiClient.post<ApiResponse<SubsidyRule>>(
      `/companies/${companyId}/subsidy-rules`,
      data
    );
    return response.data.data;
  },

  /**
   * Update subsidy rule (admin only)
   * به‌روزرسانی قانون یارانه (فقط مدیر)
   */
  async updateSubsidyRule(
    companyId: string,
    ruleId: string,
    data: Partial<CreateSubsidyRuleRequest>
  ): Promise<SubsidyRule> {
    const response = await apiClient.patch<ApiResponse<SubsidyRule>>(
      `/companies/${companyId}/subsidy-rules/${ruleId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete subsidy rule (admin only)
   * حذف قانون یارانه (فقط مدیر)
   */
  async deleteSubsidyRule(companyId: string, ruleId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/subsidy-rules/${ruleId}`);
  },

  /**
   * Get company invoices (admin only)
   * دریافت فاکتورهای شرکت (فقط مدیر)
   */
  async getCompanyInvoices(
    companyId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<PaginatedResponse<CompanyInvoice>> {
    const response = await apiClient.get<PaginatedResponse<CompanyInvoice>>(
      `/invoices/company/${companyId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get company wallet transactions (admin only)
   * دریافت تراکنش‌های کیف پول شرکت (فقط مدیر)
   */
  async getCompanyWalletTransactions(
    companyId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<CompanyWalletTransaction>> {
    const response = await apiClient.get<PaginatedResponse<CompanyWalletTransaction>>(
      `/companies/${companyId}/wallet/transactions`,
      { params }
    );
    return response.data;
  },

  /**
   * Top up company wallet (admin only)
   * شارژ کیف پول شرکت (فقط مدیر)
   */
  async topupCompanyWallet(
    companyId: string,
    data: { amount: number; gateway?: string }
  ): Promise<{ paymentId: string; paymentUrl: string; amount: number }> {
    const response = await apiClient.post<
      ApiResponse<{ paymentId: string; paymentUrl: string; amount: number }>
    >(`/companies/${companyId}/wallet/topup`, data);
    return response.data.data;
  },
};

export default companyService;
