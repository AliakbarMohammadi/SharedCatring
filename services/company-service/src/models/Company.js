const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  legalName: { type: DataTypes.STRING(255), field: 'legal_name' },
  registrationNumber: { type: DataTypes.STRING(50), unique: true, field: 'registration_number' },
  taxId: { type: DataTypes.STRING(20), field: 'tax_id' },
  status: { type: DataTypes.ENUM('pending', 'reviewing', 'approved', 'active', 'rejected', 'suspended'), defaultValue: 'pending' },
  adminUserId: { type: DataTypes.UUID, allowNull: false, field: 'admin_user_id' },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(15) },
  email: { type: DataTypes.STRING(255) },
  logoUrl: { type: DataTypes.STRING(500), field: 'logo_url' },
  contractType: { type: DataTypes.STRING(20), field: 'contract_type' },
  contractStartDate: { type: DataTypes.DATEONLY, field: 'contract_start_date' },
  contractEndDate: { type: DataTypes.DATEONLY, field: 'contract_end_date' },
  creditLimit: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0, field: 'credit_limit' },
  approvedAt: { type: DataTypes.DATE, field: 'approved_at' },
  approvedBy: { type: DataTypes.UUID, field: 'approved_by' }
}, { tableName: 'companies', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Company;
