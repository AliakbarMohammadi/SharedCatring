const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeliveryShift = sequelize.define('DeliveryShift', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false, field: 'company_id' },
  name: { type: DataTypes.STRING(50), allowNull: false },
  deliveryTime: { type: DataTypes.TIME, allowNull: false, field: 'delivery_time' },
  orderDeadline: { type: DataTypes.TIME, allowNull: false, field: 'order_deadline' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' }
}, { tableName: 'delivery_shifts', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = DeliveryShift;
