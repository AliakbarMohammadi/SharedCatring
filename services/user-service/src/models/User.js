const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  nationalCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    unique: true,
    field: 'national_code'
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'company_admin', 'company_manager', 'employee', 'kitchen_staff', 'delivery_staff'),
    defaultValue: 'employee'
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'company_id'
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'department_id'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'suspended', 'deleted'),
    defaultValue: 'pending'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      language: 'fa',
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      dietary: []
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  paranoid: true // Soft delete
});

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

module.exports = User;
