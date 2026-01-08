/**
 * Promotion Service - API Calls
 * سرویس تخفیف - فراخوانی API
 */

import apiClient, { ApiResponse } from '@/lib/api/client';

// Types
export interface PromotionValidation {
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  message?: string;
}

export interface ValidatePromotionRequest {
  code: string;
  orderAmount: number;
}

// API Functions
export const promotionService = {
  /**
   * Validate promotion code
   * اعتبارسنجی کد تخفیف
   */
  async validatePromotion(data: ValidatePromotionRequest): Promise<PromotionValidation> {
    const response = await apiClient.post<ApiResponse<PromotionValidation>>(
      '/menus/promotions/validate',
      data
    );
    return response.data.data;
  },
};

export default promotionService;
