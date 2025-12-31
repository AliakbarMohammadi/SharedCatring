const redis = require('../config/redis');
const config = require('../config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.keys = {
      todayMenu: 'menu:today',
      weeklyMenu: 'menu:weekly',
      food: (id) => `food:${id}`,
      categories: 'categories:all',
      categoryTree: 'categories:tree'
    };
  }

  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('خطا در خواندن از کش', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttl) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('خطا در نوشتن به کش', { key, error: error.message });
      return false;
    }
  }

  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('خطا در حذف از کش', { key, error: error.message });
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('خطا در حذف الگو از کش', { pattern, error: error.message });
      return false;
    }
  }

  // Category cache methods
  async getCategories() {
    return this.get(this.keys.categories);
  }

  async setCategories(categories) {
    return this.set(this.keys.categories, categories, config.cache.ttl.categories);
  }

  async invalidateCategories() {
    await this.del(this.keys.categories);
    await this.del(this.keys.categoryTree);
  }

  // Food item cache methods
  async getFood(id) {
    return this.get(this.keys.food(id));
  }

  async setFood(id, food) {
    return this.set(this.keys.food(id), food, config.cache.ttl.foodItem);
  }

  async invalidateFood(id) {
    await this.del(this.keys.food(id));
  }

  async invalidateAllFoods() {
    await this.delPattern('food:*');
  }

  // Menu cache methods
  async getTodayMenu() {
    return this.get(this.keys.todayMenu);
  }

  async setTodayMenu(menu) {
    return this.set(this.keys.todayMenu, menu, config.cache.ttl.todayMenu);
  }

  async getWeeklyMenu() {
    return this.get(this.keys.weeklyMenu);
  }

  async setWeeklyMenu(menu) {
    return this.set(this.keys.weeklyMenu, menu, config.cache.ttl.weeklyMenu);
  }

  async invalidateMenuCache() {
    await this.del(this.keys.todayMenu);
    await this.del(this.keys.weeklyMenu);
  }
}

module.exports = new CacheService();
