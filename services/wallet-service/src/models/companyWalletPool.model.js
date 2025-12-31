const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanyWalletPool = sequelize.define('CompanyWalletPool', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  companyId: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
    field: 'company_id'
  },
  totalBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_balance'
  },
  allocatedBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'allocated_balance'
  },
  availableBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'available_balance'
  },
  monthlyBudget: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'monthly_budget'
  },
  subsidyPerEmployee: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'subsidy_per_employee'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'company_wallet_pools',
  timestamps: true,
  underscored: true
});

module.exports = CompanyWalletPool;
