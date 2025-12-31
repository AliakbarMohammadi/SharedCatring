const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
    field: 'user_id'
  },
  personalBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'personal_balance'
  },
  companyBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'company_balance'
  },
  companyId: {
    type: DataTypes.UUID,
    field: 'company_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'wallets',
  timestamps: true,
  underscored: true
});

module.exports = Wallet;
