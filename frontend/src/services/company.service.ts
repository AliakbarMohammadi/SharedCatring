/**
 * Company Service - API Calls
 * سرویس شرکت - فراخوانی API
 */

import apiClient, { ApiResponse, PaginatedResponse } from '@/lib/api/client';

// Types
export interface Company {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
  subsidyPerMeal?: number;
  maxSubsidyPerDay?: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  employeeCode?: string;
  department?: string;
  isActive: boolean;
  subsidyBalance: number;
  createdAt: string;
}

export interface CompanyStats {
  employeeCount: number;
  activeEmployees: number;
  monthlyOrders: number;
  monthlySpending: number;
  totalSubsidyUsed: number;
}

export interface SubsidyRule {
  id: string;
  name: string;
  amountPerMeal: number;
  maxPerDay: number;
  maxPerMonth: number;
  isActive: boolean;
}

// API Functions
export const companyService = {
  /**
   * Get company info
   * دریافت اطلاعات شرکت
   */
  async getCompanyInfo(): Promise<Company> {
    const response = await apiClient.get<ApiResponse<Company>>('/company/info');
    return response.data.data;
  },

  /**
   * Update company info
   * به‌روزرسانی اطلاعات شرکت
   */
  async updateCompanyInfo(data: Partial<Company>): Promise<Company> {
    const response = await apiClient.put<ApiResponse<Company>>('/company/info', data);
    return response.data.data;
  },

  /**
   * Get company wallet
   * دریافت کیف پول شرکت
   */
  async getCompanyWallet(): Promise<{ balance: number; transactions: any[] }> {
    const response = await apiClient.get<ApiResponse<{ balance: number; transactions: any[] }>>('/company/wallet');
    return response.data.data;
  },

  /**
   * Get company stats
   * دریافت آمار شرکت
   */
  async getCompanyStats(): Promise<CompanyStats> {
    const response = await apiClient.get<ApiResponse<CompanyStats>>('/company/stats');
    return response.data.data;
  },

  /**
   * Get employees
   * دریافت لیست کارمندان
   */
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Employee>> {
    const response = await apiClient.get<PaginatedResponse<Employee>>('/company/employees', { params });
    return response.data;
  },

  /**
   * Get employee by ID
   * دریافت کارمند با شناسه
   */
  async getEmployeeById(id: string): Promise<Employee> {
    const response = await apiClient.get<ApiResponse<Employee>>(`/company/employees/${id}`);
    return response.data.data;
  },

  /**
   * Add employee
   * افزودن کارمند
   */
  async addEmployee(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    employeeCode?: string;
    department?: string;
  }): Promise<Employee> {
    const response = await apiClient.post<ApiResponse<Employee>>('/company/employees', data);
    return response.data.data;
  },

  /**
   * Update employee
   * به‌روزرسانی کارمند
   */
  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const response = await apiClient.put<ApiResponse<Employee>>(`/company/employees/${id}`, data);
    return response.data.data;
  },

  /**
   * Remove employee
   * حذف کارمند
   */
  async removeEmployee(id: string): Promise<void> {
    await apiClient.delete(`/company/employees/${id}`);
  },

  /**
   * Allocate subsidy to employee
   * تخصیص یارانه به کارمند
   */
  async allocateSubsidy(employeeId: string, amount: number): Promise<void> {
    await apiClient.post(`/company/employees/${employeeId}/subsidy`, { amount });
  },

  /**
   * Get company orders
   * دریافت سفارشات شرکت
   */
  async getCompanyOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>('/company/orders', { params });
    return response.data;
  },

  /**
   * Get subsidy rules
   * دریافت قوانین یارانه
   */
  async getSubsidyRules(): Promise<SubsidyRule[]> {
    const response = await apiClient.get<ApiResponse<SubsidyRule[]>>('/company/subsidy-rules');
    return response.data.data;
  },

  /**
   * Update subsidy rules
   * به‌روزرسانی قوانین یارانه
   */
  async updateSubsidyRules(data: Partial<SubsidyRule>): Promise<SubsidyRule> {
    const response = await apiClient.put<ApiResponse<SubsidyRule>>('/company/subsidy-rules', data);
    return response.data.data;
  },

  /**
   * Get departments
   * دریافت دپارتمان‌ها
   */
  async getDepartments(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/company/departments');
    return response.data.data;
  },

  /**
   * Get company reports
   * دریافت گزارشات شرکت
   */
  async getReports(params?: {
    type: 'daily' | 'weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/company/reports', { params });
    return response.data.data;
  },

  /**
   * Export report
   * خروجی گزارش
   */
  async exportReport(params: {
    type: 'daily' | 'weekly' | 'monthly';
    format: 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await apiClient.get('/company/reports/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default companyService;
