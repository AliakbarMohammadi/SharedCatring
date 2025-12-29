const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  walletId: { type: DataTypes.UUID, allowNull: false, field: 'wallet_id' },
  type: { type: DataTypes.ENUM('deposit', 'withdrawal', 'payment', 'refund', 'transfer', 'bonus'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  balanceBefore: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'balance_before' },
  balanceAfter: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'balance_after' },
  referenceId: { type: DataTypes.STRING(100), field: 'reference_id' },
  referenceType: { type: DataTypes.STRING(50), field: 'reference_type' },
  description: { type: DataTypes.STRING(500) },
  status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'reversed'), defaultValue: 'completed' },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'transactions', timestamps: true, underscored: true });

module.exports = Transaction;
