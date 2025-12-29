const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'user_id' },
  companyId: { type: DataTypes.UUID, allowNull: true, field: 'company_id' },
  balance: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'IRR' },
  status: { type: DataTypes.ENUM('active', 'frozen', 'closed'), defaultValue: 'active' },
  dailyLimit: { type: DataTypes.DECIMAL(14, 2), defaultValue: 10000000, field: 'daily_limit' },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'wallets', timestamps: true, underscored: true });

module.exports = Wallet;
