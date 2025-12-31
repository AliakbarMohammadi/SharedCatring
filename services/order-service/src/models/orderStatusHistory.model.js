const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id',
    references: { model: 'orders', key: 'id' }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  changedBy: {
    type: DataTypes.UUID,
    field: 'changed_by'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'order_status_history',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

module.exports = OrderStatusHistory;
