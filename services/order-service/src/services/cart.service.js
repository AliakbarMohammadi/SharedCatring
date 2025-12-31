const { Cart, CartItem } = require('../models');
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
    const cart = await this.getOrCreateCart(userId);
    const { foodId, foodName, quantity, unitPrice, notes } = itemData;

    // Check if item already exists
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, foodId }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      if (notes) cartItem.notes = notes;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        foodId,
        foodName,
        quantity,
        unitPrice,
        notes
      });
    }

    logger.info('آیتم به سبد خرید اضافه شد', { userId, foodId, quantity });
    return this.getCart(userId);
  }

  async updateItem(userId, itemId, updateData) {
    const cart = await this.getOrCreateCart(userId);
    
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'آیتم در سبد خرید یافت نشد' };
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
      throw { statusCode: 404, code: 'ERR_ITEM_NOT_FOUND', message: 'آیتم در سبد خرید یافت نشد' };
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
