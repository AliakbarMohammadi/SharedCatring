const { Category } = require('../models');
const cacheService = require('./cache.service');
const logger = require('../utils/logger');

class CategoryService {
  async create(data) {
    // Check parent exists if provided
    if (data.parentId) {
      const parent = await Category.findById(data.parentId);
      if (!parent) {
        throw { statusCode: 404, code: 'ERR_PARENT_NOT_FOUND', message: 'دسته‌بندی والد یافت نشد' };
      }
    }

    const category = await Category.create(data);
    await cacheService.invalidateCategories();
    
    logger.info('دسته‌بندی ایجاد شد', { categoryId: category._id, name: category.name });
    return category;
  }

  async findAll(options = {}) {
    const { includeInactive = false, parentId = null } = options;

    // Try cache first
    if (!includeInactive && parentId === null) {
      const cached = await cacheService.getCategories();
      if (cached) return cached;
    }

    const query = {};
    if (!includeInactive) query.isActive = true;
    if (parentId !== undefined) query.parentId = parentId;

    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .lean();

    // Cache if default query
    if (!includeInactive && parentId === null) {
      await cacheService.setCategories(categories);
    }

    return categories;
  }

  async findById(id) {
    const category = await Category.findById(id).populate('children').lean();
    if (!category) {
      throw { statusCode: 404, code: 'ERR_CATEGORY_NOT_FOUND', message: 'دسته‌بندی یافت نشد' };
    }
    return category;
  }

  async findBySlug(slug) {
    const category = await Category.findOne({ slug }).populate('children').lean();
    if (!category) {
      throw { statusCode: 404, code: 'ERR_CATEGORY_NOT_FOUND', message: 'دسته‌بندی یافت نشد' };
    }
    return category;
  }

  async update(id, data) {
    const category = await Category.findById(id);
    if (!category) {
      throw { statusCode: 404, code: 'ERR_CATEGORY_NOT_FOUND', message: 'دسته‌بندی یافت نشد' };
    }

    // Check parent if changing
    if (data.parentId && data.parentId !== category.parentId?.toString()) {
      if (data.parentId === id) {
        throw { statusCode: 400, code: 'ERR_INVALID_PARENT', message: 'دسته‌بندی نمی‌تواند والد خودش باشد' };
      }
      const parent = await Category.findById(data.parentId);
      if (!parent) {
        throw { statusCode: 404, code: 'ERR_PARENT_NOT_FOUND', message: 'دسته‌بندی والد یافت نشد' };
      }
    }

    Object.assign(category, data);
    await category.save();
    await cacheService.invalidateCategories();

    logger.info('دسته‌بندی ویرایش شد', { categoryId: id });
    return category;
  }

  async delete(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw { statusCode: 404, code: 'ERR_CATEGORY_NOT_FOUND', message: 'دسته‌بندی یافت نشد' };
    }

    // Check for children
    const childCount = await Category.countDocuments({ parentId: id });
    if (childCount > 0) {
      throw { statusCode: 400, code: 'ERR_HAS_CHILDREN', message: 'این دسته‌بندی دارای زیردسته است و قابل حذف نیست' };
    }

    // Check for food items
    const { FoodItem } = require('../models');
    const foodCount = await FoodItem.countDocuments({ categoryId: id });
    if (foodCount > 0) {
      throw { statusCode: 400, code: 'ERR_HAS_ITEMS', message: 'این دسته‌بندی دارای غذا است و قابل حذف نیست' };
    }

    await category.deleteOne();
    await cacheService.invalidateCategories();

    logger.info('دسته‌بندی حذف شد', { categoryId: id });
    return { id };
  }

  async updateOrder(id, order) {
    const category = await Category.findById(id);
    if (!category) {
      throw { statusCode: 404, code: 'ERR_CATEGORY_NOT_FOUND', message: 'دسته‌بندی یافت نشد' };
    }

    category.order = order;
    await category.save();
    await cacheService.invalidateCategories();

    return category;
  }

  async getTree() {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    // Build tree structure
    const map = {};
    const roots = [];

    categories.forEach(cat => {
      map[cat._id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat._id]);
      } else {
        roots.push(map[cat._id]);
      }
    });

    return roots;
  }
}

module.exports = new CategoryService();
