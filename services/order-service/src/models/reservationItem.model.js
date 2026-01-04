const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReservationItem = sequelize.define('ReservationItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reservationId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'reservation_id',
    references: { model: 'weekly_reservations', key: 'id' }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  mealType: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner'),
    allowNull: false,
    field: 'meal_type'
  },
  foodId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'food_id'
  },
  foodName: {
    type: DataTypes.STRING(255),
    field: 'food_name'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'unit_price'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ordered', 'cancelled'),
    defaultValue: 'scheduled'
  }
}, {
  tableName: 'reservation_items',
  timestamps: true,
  underscored: true
});

module.exports = ReservationItem;
