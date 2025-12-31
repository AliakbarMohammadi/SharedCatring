const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'cart_id',
    references: { model: 'carts', key: 'id' }
  },
  foodId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'food_id'
  },
  foodName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'food_name'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'cart_items',
  timestamps: true,
  underscored: true
});

module.exports = CartItem;
