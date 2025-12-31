const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  walletId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'wallet_id',
    references: { model: 'wallets', key: 'id' }
  },
  type: {
    type: DataTypes.ENUM(
      'topup_personal',
      'topup_company',
      'subsidy_allocation',
      'order_payment',
      'order_refund',
      'subsidy_expiry',
      'withdrawal',
      'transfer_in',
      'transfer_out',
      'adjustment'
    ),
    allowNull: false
  },
  balanceType: {
    type: DataTypes.ENUM('personal', 'company'),
    allowNull: false,
    field: 'balance_type'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  balanceBefore: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'balance_before'
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'balance_after'
  },
  referenceType: {
    type: DataTypes.STRING(50),
    field: 'reference_type'
  },
  referenceId: {
    type: DataTypes.UUID,
    field: 'reference_id'
  },
  description: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'wallet_transactions',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

module.exports = WalletTransaction;
