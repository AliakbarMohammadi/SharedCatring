const { Cart, CartItem } = require('../models');
const menuClient = require('../utils/menuClient');
const logger = require('../utils/logger');

class CartService {
  async getOrCreateCart(userId) {
    let cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, as: 'items' }]
    });

    if (!cart) {
      cart = await Cart.create({ userId });
      cart.items = [];
    }

    return cart;
  }

  async getCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);

    return {
      id: cart.id,
      items: cart.items.map(item => ({
        id: item.id,
        foodId: item.foodId,
        foodName: item.foodName,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.unitPrice) * item.quantity,
        notes: item.notes
      })),
      itemCount: cart.items.length,
      subtotal
    };
  }

  async addItem(userId, itemData) {
    const { foodId, quantity, notes, foodName: fallbackName, unitPrice: fallbackPrice } = itemData;

    // Prepare fallback data if provided by client
    const fallback = (fallbackName && fallbackPrice) ? {
      id: foodId,
      name: fallbackName,
      price: parseFloat(fallbackPrice),
      isAvailable: true
    } : null;

    // Try to fetch food info from Menu Service
    let food = null;
    try {
      food = await menuClient.getFoodById(foodId, fallback);
    } catch (error) {
      logger.error('خطا در دریافت اطلاعات غذا', { foodId, error: error.message });
      
      // If we have fallback data, use it
      if (fallback) {
        logger.info('استفاده از داده‌های ارسالی کاربر به عنوان fallback', { foodId, fallback });
        food = fallback;
      } else {
        throw error;
      }
    }
    
    if (!food) {
      throw {
        statusCode: 404,
        code: 'ERR_FOOD_NOT_FOUND',
        message: 'غذای مورد نظر یافت نشد'
      };
    }

    if (!food.isAvailable) {
      throw {
        statusCode: 400,
        code: 'ERR_FOOD_UNAVAILABLE',
        message: 'این غذا در حال حاضر موجود نیست'
      };
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, foodId }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      // Update price in case it changed
      cartItem.unitPrice = food.price;
      cartItem.foodName = food.name;
      if (notes) cartItem.notes = notes;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        foodId,
        foodName: food.name,
        quantity,
        unitPrice: food.price,
        notes
      });
    }

    logger.info('آیتم به سبد خرید اضافه شد', { 
      userId, 
      foodId, 
      foodName: food.name,
      quantity,
      unitPrice: food.price
    });
    
    return this.getCart(userId);
  }

  async updateItem(userId, itemId, updateData) {
    const cart = await this.getOrCreateCart(userId);
    
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
      throw { 
        statusCode: 404, 
        code: 'ERR_ITEM_NOT_FOUND', 
        message: 'آیتم در سبد خرید یافت نشد' 
      };
    }

    const { quantity, notes } = updateData;
    if (quantity !== undefined) {
      if (quantity <= 0) {
        await cartItem.destroy();
        logger.info('آیتم از سبد خرید حذف شد', { userId, itemId });
      } else {
        cartItem.quantity = quantity;
        if (notes !== undefined) cartItem.notes = notes;
        await cartItem.save();
      }
    }

    return this.getCart(userId);
  }

  async removeItem(userId, itemId) {
    const cart = await this.getOrCreateCart(userId);
    
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
      throw { 
        statusCode: 404, 
        code: 'ERR_ITEM_NOT_FOUND', 
        message: 'آیتم در سبد خرید یافت نشد' 
      };
    }

    await cartItem.destroy();
    logger.info('آیتم از سبد خرید حذف شد', { userId, itemId });
    
    return this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ where: { userId } });
    
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
      logger.info('سبد خرید خالی شد', { userId });
    }

    return { items: [], itemCount: 0, subtotal: 0 };
  }
}

module.exports = new CartService();
