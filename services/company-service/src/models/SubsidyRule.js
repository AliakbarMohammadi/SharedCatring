const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubsidyRule = sequelize.define('SubsidyRule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false, field: 'company_id' },
  name: { type: DataTypes.STRING(100) },
  ruleType: { type: DataTypes.STRING(20), field: 'rule_type' },
  percentage: { type: DataTypes.INTEGER },
  fixedAmount: { type: DataTypes.DECIMAL(10, 2), field: 'fixed_amount' },
  maxPerMeal: { type: DataTypes.DECIMAL(10, 2), field: 'max_per_meal' },
  maxPerDay: { type: DataTypes.DECIMAL(10, 2), field: 'max_per_day' },
  maxPerMonth: { type: DataTypes.DECIMAL(15, 2), field: 'max_per_month' },
  applicableMeals: { type: DataTypes.ARRAY(DataTypes.TEXT), field: 'applicable_meals' },
  startDate: { type: DataTypes.DATEONLY, field: 'start_date' },
  endDate: { type: DataTypes.DATEONLY, field: 'end_date' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  priority: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'subsidy_rules', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = SubsidyRule;
