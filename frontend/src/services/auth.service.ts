/**
 * Auth Service - API Calls
 * سرویس احراز هویت - فراخوانی API
 */

import apiClient, { ApiResponse, getErrorMessage } from '@/lib/api/client';
import { User } from '@/stores/auth.store';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  firstName?: string;
  lastName?: string;
  // Note: role is NOT accepted from user input for security
  // All public registrations are assigned 'personal_user' role
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// API Functions
export const authService = {
  /**
   * Login user
   * ورود کاربر
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      data
    );
    return response.data.data;
  },

  /**
   * Register new user
   * ثبت‌نام کاربر جدید
   * Note: role is hardcoded to 'personal_user' for security
   */
  async register(data: RegisterRequest): Promise<{ userId: string; email: string }> {
    // Security: Always set role to personal_user, ignore any role from input
    const secureData = {
      ...data,
      role: 'personal_user' as const
    };
    const response = await apiClient.post<ApiResponse<{ userId: string; email: string }>>(
      '/auth/register',
      secureData
    );
    return response.data.data;
  },

  /**
   * Logout user
   * خروج کاربر
   */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  /**
   * Refresh access token
   * تمدید توکن دسترسی
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data.data;
  },

  /**
   * Request password reset
   * درخواست بازیابی رمز عبور
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', data);
  },

  /**
   * Reset password
   * بازنشانی رمز عبور
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  },

  /**
   * Verify token
   * تأیید توکن
   */
  async verifyToken(token: string): Promise<{ valid: boolean; userId: string }> {
    const response = await apiClient.post<ApiResponse<{ valid: boolean; userId: string }>>(
      '/auth/verify-token',
      { token }
    );
    return response.data.data;
  },

  /**
   * Get active sessions
   * دریافت نشست‌های فعال
   */
  async getSessions(): Promise<Array<{
    id: string;
    device: string;
    browser: string;
    os: string;
    ip: string;
    lastActivity: string;
  }>> {
    const response = await apiClient.get('/auth/sessions');
    return response.data.data;
  },

  /**
   * Logout from all devices
   * خروج از همه دستگاه‌ها
   */
  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  },
};

export default authService;
