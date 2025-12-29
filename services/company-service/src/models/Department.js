const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false, field: 'company_id' },
  name: { type: DataTypes.STRING(100), allowNull: false },
  code: { type: DataTypes.STRING(20) },
  parentId: { type: DataTypes.UUID, field: 'parent_id' },
  managerUserId: { type: DataTypes.UUID, field: 'manager_user_id' },
  monthlyBudget: { type: DataTypes.DECIMAL(15, 2), field: 'monthly_budget' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' }
}, { tableName: 'departments', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = Department;
