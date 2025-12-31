const Cart = require('./cart.model');
const CartItem = require('./cartItem.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const OrderStatusHistory = require('./orderStatusHistory.model');
const WeeklyReservation = require('./weeklyReservation.model');
const ReservationItem = require('./reservationItem.model');

// Cart associations
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// Order associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory', onDelete: 'CASCADE' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Weekly reservation associations
WeeklyReservation.hasMany(ReservationItem, { foreignKey: 'reservationId', as: 'items', onDelete: 'CASCADE' });
ReservationItem.belongsTo(WeeklyReservation, { foreignKey: 'reservationId', as: 'reservation' });

module.exports = {
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  WeeklyReservation,
  ReservationItem
};
