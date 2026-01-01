/**
 * User Service - API Calls
 * سرویس کاربر - فراخوانی API
 */

import apiClient, { ApiResponse } from '@/lib/api/client';
import { User } from '@/stores/auth.store';

// Types
export interface UserProfile extends User {
  phone?: string;
  nationalId?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  addresses?: UserAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: string;
  title: string;
  address: string;
  fullAddress?: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  isDefault: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationalId?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateAddressRequest {
  title: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  isDefault?: boolean;
}

// API Functions
export const userService = {
  /**
   * Get current user profile
   * دریافت پروفایل کاربر جاری
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/users/profile');
    return response.data.data;
  },

  /**
   * Update user profile
   * به‌روزرسانی پروفایل کاربر
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(
      '/users/profile',
      data
    );
    return response.data.data;
  },

  /**
   * Change password
   * تغییر رمز عبور
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/users/change-password', data);
  },

  /**
   * Upload avatar
   * آپلود تصویر پروفایل
   */
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      '/users/avatar',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  },

  /**
   * Get user addresses
   * دریافت آدرس‌های کاربر
   */
  async getAddresses(): Promise<UserAddress[]> {
    const response = await apiClient.get<ApiResponse<UserAddress[]>>('/users/addresses');
    return response.data.data;
  },

  /**
   * Create address
   * ایجاد آدرس جدید
   */
  async createAddress(data: CreateAddressRequest): Promise<UserAddress> {
    const response = await apiClient.post<ApiResponse<UserAddress>>(
      '/users/addresses',
      data
    );
    return response.data.data;
  },

  /**
   * Add address (alias for createAddress)
   * افزودن آدرس
   */
  async addAddress(data: { title: string; fullAddress: string; postalCode?: string }): Promise<UserAddress> {
    return this.createAddress({
      title: data.title,
      address: data.fullAddress,
      city: '',
      province: '',
      postalCode: data.postalCode,
    });
  },

  /**
   * Update address
   * به‌روزرسانی آدرس
   */
  async updateAddress(id: string, data: Partial<CreateAddressRequest> | { title?: string; fullAddress?: string; postalCode?: string }): Promise<UserAddress> {
    const updateData: Partial<CreateAddressRequest> = {};
    if ('fullAddress' in data && data.fullAddress) {
      updateData.address = data.fullAddress;
    }
    if ('title' in data && data.title) {
      updateData.title = data.title;
    }
    if ('postalCode' in data) {
      updateData.postalCode = data.postalCode;
    }
    if ('address' in data) {
      updateData.address = data.address;
    }
    const response = await apiClient.patch<ApiResponse<UserAddress>>(
      `/users/addresses/${id}`,
      updateData
    );
    return response.data.data;
  },

  /**
   * Delete address
   * حذف آدرس
   */
  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/users/addresses/${id}`);
  },

  /**
   * Set default address
   * تنظیم آدرس پیش‌فرض
   */
  async setDefaultAddress(id: string): Promise<UserAddress> {
    const response = await apiClient.patch<ApiResponse<UserAddress>>(
      `/users/addresses/${id}/default`
    );
    return response.data.data;
  },
};

export default userService;
