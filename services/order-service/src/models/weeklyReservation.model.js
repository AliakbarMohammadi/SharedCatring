const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WeeklyReservation = sequelize.define('WeeklyReservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  companyId: {
    type: DataTypes.UUID,
    field: 'company_id'
  },
  weekStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'week_start_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'completed'),
    defaultValue: 'active'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'total_amount'
  }
}, {
  tableName: 'weekly_reservations',
  timestamps: true,
  underscored: true
});

module.exports = WeeklyReservation;
