const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const DailyMenu = require('../models/DailyMenu');

class MenuService {
  // Category methods
  async createCategory(data) {
    return Category.create(data);
  }

  async getCategories(options = {}) {
    const { parentId = null, includeInactive = false } = options;
    const query = { parentId };
    if (!includeInactive) query.isActive = true;
    
    return Category.find(query)
      .sort({ order: 1, name: 1 })
      .populate('subcategories');
  }

  async getCategoryById(id) {
    const category = await Category.findById(id).populate('subcategories');
    if (!category) {
      const error = new Error('دسته‌بندی یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1402';
      throw error;
    }
    return category;
  }

  async updateCategory(id, data) {
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) {
      const error = new Error('دسته‌بندی یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1402';
      throw error;
    }
    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      const error = new Error('دسته‌بندی یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1402';
      throw error;
    }
    return category;
  }

  // Menu Item methods
  async createMenuItem(data) {
    return MenuItem.create(data);
  }

  async getMenuItems(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      categoryId, 
      search, 
      minPrice, 
      maxPrice,
      dietary,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      onlyAvailable = true
    } = options;

    const query = { isActive: true };
    
    if (onlyAvailable) query.isAvailable = true;
    if (categoryId) query.categoryId = categoryId;
    if (minPrice !== undefined) query.price = { ...query.price, $gte: minPrice };
    if (maxPrice !== undefined) query.price = { ...query.price, $lte: maxPrice };
    if (dietary && dietary.length) query.dietary = { $in: dietary };
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      MenuItem.find(query)
        .populate('categoryId', 'name nameEn')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      MenuItem.countDocuments(query)
    ]);

    return { items, total, page, limit };
  }

  async getMenuItemById(id) {
    const item = await MenuItem.findById(id).populate('categoryId', 'name nameEn');
    if (!item) {
      const error = new Error('آیتم منو یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1401';
      throw error;
    }
    return item;
  }

  async updateMenuItem(id, data) {
    const item = await MenuItem.findByIdAndUpdate(id, data, { new: true });
    if (!item) {
      const error = new Error('آیتم منو یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1401';
      throw error;
    }
    return item;
  }

  async deleteMenuItem(id) {
    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) {
      const error = new Error('آیتم منو یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1401';
      throw error;
    }
    return item;
  }

  async updateItemAvailability(id, isAvailable) {
    return MenuItem.findByIdAndUpdate(id, { isAvailable }, { new: true });
  }

  // Daily Menu methods
  async createDailyMenu(data) {
    const existing = await DailyMenu.findOne({
      companyId: data.companyId,
      date: data.date,
      mealType: data.mealType
    });

    if (existing) {
      const error = new Error('منوی روزانه برای این تاریخ و وعده قبلاً ایجاد شده است');
      error.statusCode = 409;
      error.errorCode = 'ERR_1006';
      throw error;
    }

    return DailyMenu.create(data);
  }

  async getDailyMenus(options = {}) {
    const { companyId, date, startDate, endDate, mealType, page = 1, limit = 10 } = options;
    
    const query = { isActive: true };
    if (companyId) query.companyId = companyId;
    if (mealType) query.mealType = mealType;
    
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: dayStart, $lte: dayEnd };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    const [menus, total] = await Promise.all([
      DailyMenu.find(query)
        .populate('items.menuItemId')
        .sort({ date: 1, mealType: 1 })
        .skip(skip)
        .limit(limit),
      DailyMenu.countDocuments(query)
    ]);

    return { menus, total, page, limit };
  }

  async getDailyMenuById(id) {
    const menu = await DailyMenu.findById(id).populate('items.menuItemId');
    if (!menu) {
      const error = new Error('منو یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1400';
      throw error;
    }
    return menu;
  }

  async updateDailyMenu(id, data) {
    const menu = await DailyMenu.findByIdAndUpdate(id, data, { new: true });
    if (!menu) {
      const error = new Error('منو یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1400';
      throw error;
    }
    return menu;
  }

  async addItemToDailyMenu(menuId, itemData) {
    const menu = await DailyMenu.findById(menuId);
    if (!menu) {
      const error = new Error('منو یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1400';
      throw error;
    }

    menu.items.push(itemData);
    return menu.save();
  }

  async removeItemFromDailyMenu(menuId, menuItemId) {
    const menu = await DailyMenu.findById(menuId);
    if (!menu) {
      const error = new Error('منو یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1400';
      throw error;
    }

    menu.items = menu.items.filter(item => item.menuItemId.toString() !== menuItemId);
    return menu.save();
  }

  async decrementItemQuantity(menuId, menuItemId, quantity = 1) {
    const menu = await DailyMenu.findById(menuId);
    if (!menu) return null;

    const item = menu.items.find(i => i.menuItemId.toString() === menuItemId);
    if (item && item.remainingQuantity !== null) {
      item.remainingQuantity = Math.max(0, item.remainingQuantity - quantity);
      if (item.remainingQuantity === 0) {
        item.isAvailable = false;
      }
      await menu.save();
    }
    return menu;
  }
}

module.exports = new MenuService();
