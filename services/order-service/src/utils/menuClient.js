const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

/**
 * Menu Service Client
 * کلاینت برای ارتباط با سرویس منو
 */
class MenuClient {
  constructor() {
    this.baseUrl = config.services.menu;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info('Menu Client initialized', { baseUrl: this.baseUrl });
  }

  /**
   * Get food item by ID
   * دریافت اطلاعات غذا با شناسه
   * @param {string} foodId - MongoDB ObjectId or any string ID
   * @param {object} fallback - Optional fallback data if service unavailable
   * @returns {Promise<{id: string, name: string, price: number, isAvailable: boolean} | null>}
   */
  async getFoodById(foodId, fallback = null) {
    // Correct endpoint: /api/v1/menu/items/:id
    const url = `/api/v1/menu/items/${foodId}`;
    
    logger.debug('درخواست به Menu Service', { 
      baseUrl: this.baseUrl,
      url,
      fullUrl: `${this.baseUrl}${url}`,
      foodId 
    });

    try {
      const response = await this.client.get(url);
      
      logger.debug('پاسخ از Menu Service', {
        status: response.status,
        success: response.data?.success,
        hasData: !!response.data?.data
      });

      if (response.data.success && response.data.data) {
        const food = response.data.data;
        
        // Extract price from pricing object or direct price field
        let price = 0;
        if (food.pricing?.basePrice) {
          price = parseFloat(food.pricing.basePrice);
        } else if (food.price) {
          price = parseFloat(food.price);
        }

        return {
          id: food._id || food.id,
          name: food.name,
          price,
          isAvailable: food.isAvailable !== false
        };
      }
      
      logger.warn('پاسخ نامعتبر از Menu Service', { 
        foodId, 
        response: response.data 
      });
      return fallback;
      
    } catch (error) {
      // Log detailed error information
      const errorDetails = {
        foodId,
        url: `${this.baseUrl}${url}`,
        errorCode: error.code,
        errorMessage: error.message,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      };

      if (error.response?.status === 404) {
        logger.warn('غذا در Menu Service یافت نشد', errorDetails);
        return fallback;
      }

      if (error.code === 'ECONNREFUSED') {
        logger.error('Menu Service در دسترس نیست (ECONNREFUSED)', errorDetails);
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        logger.error('Timeout در ارتباط با Menu Service', errorDetails);
      } else {
        logger.error('خطا در دریافت اطلاعات غذا از Menu Service', errorDetails);
      }

      // If fallback provided, use it instead of throwing
      if (fallback) {
        logger.info('استفاده از داده‌های fallback', { foodId, fallback });
        return fallback;
      }

      throw {
        statusCode: 503,
        code: 'ERR_MENU_SERVICE_UNAVAILABLE',
        message: 'سرویس منو در دسترس نیست. لطفاً بعداً تلاش کنید'
      };
    }
  }

  /**
   * Get multiple food items by IDs
   * دریافت اطلاعات چند غذا
   * @param {string[]} foodIds
   * @param {Map<string, object>} fallbackMap - Optional fallback data map
   * @returns {Promise<Map<string, {id: string, name: string, price: number}>>}
   */
  async getFoodsByIds(foodIds, fallbackMap = new Map()) {
    const foodMap = new Map();
    
    // Fetch foods in parallel
    const promises = foodIds.map(async (foodId) => {
      const fallback = fallbackMap.get(foodId) || null;
      const food = await this.getFoodById(foodId, fallback);
      if (food) {
        foodMap.set(foodId, food);
      }
    });
    
    await Promise.all(promises);
    return foodMap;
  }

  /**
   * Check if Menu Service is healthy
   * بررسی سلامت سرویس منو
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health', { timeout: 3000 });
      return response.data?.success === true;
    } catch (error) {
      logger.warn('Menu Service health check failed', { error: error.message });
      return false;
    }
  }
}

module.exports = new MenuClient();
