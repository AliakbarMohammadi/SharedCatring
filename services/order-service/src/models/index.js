const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  Order,
  OrderItem
};
