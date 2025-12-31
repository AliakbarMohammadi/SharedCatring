const { cartService } = require('../../services');

class CartController {
  async getCart(req, res, next) {
    try {
      const userId = req.user.userId;
      const cart = await cartService.getCart(userId);

      res.json({
        success: true,
        data: cart,
        message: 'سبد خرید'
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const userId = req.user.userId;
      const cart = await cartService.addItem(userId, req.body);

      res.status(201).json({
        success: true,
        data: cart,
        message: 'آیتم به سبد خرید اضافه شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const cart = await cartService.updateItem(userId, id, req.body);

      res.json({
        success: true,
        data: cart,
        message: 'سبد خرید به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const cart = await cartService.removeItem(userId, id);

      res.json({
        success: true,
        data: cart,
        message: 'آیتم از سبد خرید حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const userId = req.user.userId;
      const cart = await cartService.clearCart(userId);

      res.json({
        success: true,
        data: cart,
        message: 'سبد خرید خالی شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
