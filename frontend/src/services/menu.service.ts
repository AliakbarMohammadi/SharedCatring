/**
 * Menu Service - API Calls
 * سرویس منو - فراخوانی API
 */

import apiClient, { ApiResponse, PaginatedResponse } from '@/lib/api/client';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  categoryName?: string;
  calories?: number;
  preparationTime?: number;
  ingredients?: string[];
  isAvailable: boolean;
  isPopular?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface DailyMenu {
  id: string;
  date: string;
  title?: string;
  items: Array<{
    foodId: string;
    food: FoodItem;
    available: boolean;
    maxQuantity?: number;
  }>;
  isPublished: boolean;
}

export interface WeeklyMenu {
  id: string;
  startDate: string;
  endDate: string;
  days: Array<{
    date: string;
    dayName: string;
    items: Array<{
      foodId: string;
      food: FoodItem;
      available: boolean;
    }>;
  }>;
}

// API Functions
export const menuService = {
  /**
   * Get all categories
   * دریافت همه دسته‌بندی‌ها
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/menu/categories');
    return response.data.data;
  },

  /**
   * Get foods by category
   * دریافت غذاها بر اساس دسته‌بندی
   */
  async getFoodsByCategory(
    categoryId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<FoodItem>> {
    const response = await apiClient.get<PaginatedResponse<FoodItem>>(
      `/menu/categories/${categoryId}/foods`,
      { params }
    );
    return response.data;
  },

  /**
   * Get all foods
   * دریافت همه غذاها
   */
  async getFoods(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    available?: boolean;
  }): Promise<PaginatedResponse<FoodItem>> {
    const response = await apiClient.get<PaginatedResponse<FoodItem>>('/menu/foods', {
      params,
    });
    return response.data;
  },

  /**
   * Get food by ID
   * دریافت غذا با شناسه
   */
  async getFoodById(id: string): Promise<FoodItem> {
    const response = await apiClient.get<ApiResponse<FoodItem>>(`/menu/foods/${id}`);
    return response.data.data;
  },

  /**
   * Get daily menu
   * دریافت منوی روزانه
   */
  async getDailyMenu(date?: string): Promise<DailyMenu> {
    const params = date ? { date } : {};
    const response = await apiClient.get<ApiResponse<DailyMenu>>('/menu/daily', { params });
    return response.data.data;
  },

  /**
   * Get weekly menu
   * دریافت منوی هفتگی
   */
  async getWeeklyMenu(startDate?: string): Promise<WeeklyMenu> {
    const params = startDate ? { startDate } : {};
    const response = await apiClient.get<ApiResponse<WeeklyMenu>>('/menu/weekly', { params });
    return response.data.data;
  },

  /**
   * Search foods
   * جستجوی غذاها
   */
  async searchFoods(query: string): Promise<FoodItem[]> {
    const response = await apiClient.get<ApiResponse<FoodItem[]>>('/menu/foods/search', {
      params: { q: query },
    });
    return response.data.data;
  },

  /**
   * Get popular foods
   * دریافت غذاهای پرطرفدار
   */
  async getPopularFoods(limit = 10): Promise<FoodItem[]> {
    const response = await apiClient.get<ApiResponse<FoodItem[]>>('/menu/foods/popular', {
      params: { limit },
    });
    return response.data.data;
  },
};

export default menuService;
