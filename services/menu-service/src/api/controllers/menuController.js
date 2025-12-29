const menuService = require('../../services/menuService');

class MenuController {
  // Category endpoints
  async createCategory(req, res, next) {
    try {
      const category = await menuService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: category,
        message: 'دسته‌بندی با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const { parentId, includeInactive } = req.query;
      const categories = await menuService.getCategories({ 
        parentId: parentId || null, 
        includeInactive: includeInactive === 'true' 
      });
      res.json({
        success: true,
        data: categories,
        message: 'اطلاعات با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await menuService.getCategoryById(req.params.id);
      res.json({
        success: true,
        data: category,
        message: 'اطلاعات با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await menuService.updateCategory(req.params.id, req.body);
      res.json({
        success: true,
        data: category,
        message: 'دسته‌بندی با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await menuService.deleteCategory(req.params.id);
      res.json({
        success: true,
        data: null,
        message: 'دسته‌بندی با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Menu Item endpoints
  async createMenuItem(req, res, next) {
    try {
      const item = await menuService.createMenuItem(req.body);
      res.status(201).json({
        success: true,
        data: item,
        message: 'آیتم منو با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getMenuItems(req, res, next) {
    try {
      const result = await menuService.getMenuItems(req.query);
      res.json({
        success: true,
        data: result.items,
        message: 'اطلاعات با موفقیت دریافت شد',
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMenuItemById(req, res, next) {
    try {
      const item = await menuService.getMenuItemById(req.params.id);
      res.json({
        success: true,
        data: item,
        message: 'اطلاعات با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMenuItem(req, res, next) {
    try {
      const item = await menuService.updateMenuItem(req.params.id, req.body);
      res.json({
        success: true,
        data: item,
        message: 'آیتم منو با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMenuItem(req, res, next) {
    try {
      await menuService.deleteMenuItem(req.params.id);
      res.json({
        success: true,
        data: null,
        message: 'آیتم منو با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItemAvailability(req, res, next) {
    try {
      const { isAvailable } = req.body;
      const item = await menuService.updateItemAvailability(req.params.id, isAvailable);
      res.json({
        success: true,
        data: item,
        message: isAvailable ? 'آیتم فعال شد' : 'آیتم غیرفعال شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Daily Menu endpoints
  async createDailyMenu(req, res, next) {
    try {
      const menu = await menuService.createDailyMenu(req.body);
      res.status(201).json({
        success: true,
        data: menu,
        message: 'منوی روزانه با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailyMenus(req, res, next) {
    try {
      const result = await menuService.getDailyMenus(req.query);
      res.json({
        success: true,
        data: result.menus,
        message: 'اطلاعات با موفقیت دریافت شد',
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailyMenuById(req, res, next) {
    try {
      const menu = await menuService.getDailyMenuById(req.params.id);
      res.json({
        success: true,
        data: menu,
        message: 'اطلاعات با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDailyMenu(req, res, next) {
    try {
      const menu = await menuService.updateDailyMenu(req.params.id, req.body);
      res.json({
        success: true,
        data: menu,
        message: 'منوی روزانه با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async addItemToDailyMenu(req, res, next) {
    try {
      const menu = await menuService.addItemToDailyMenu(req.params.id, req.body);
      res.json({
        success: true,
        data: menu,
        message: 'آیتم با موفقیت به منو اضافه شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeItemFromDailyMenu(req, res, next) {
    try {
      const menu = await menuService.removeItemFromDailyMenu(req.params.id, req.params.itemId);
      res.json({
        success: true,
        data: menu,
        message: 'آیتم با موفقیت از منو حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
