const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Employee Model
 * مدل کارمند - بدون وابستگی به دپارتمان
 */
const Employee = sequelize.define('Employee', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false, 
    field: 'user_id',
    unique: true // هر کاربر فقط می‌تواند در یک شرکت کارمند باشد
  },
  companyId: { 
    type: DataTypes.UUID, 
    allowNull: false, 
    field: 'company_id' 
  },
  employeeCode: { 
    type: DataTypes.STRING(50), 
    field: 'employee_code' 
  },
  jobTitle: { 
    type: DataTypes.STRING(100), 
    field: 'job_title' 
  },
  shiftId: { 
    type: DataTypes.UUID, 
    field: 'shift_id' 
  },
  dailySubsidyLimit: { 
    type: DataTypes.DECIMAL(10, 2), 
    field: 'daily_subsidy_limit' 
  },
  monthlySubsidyLimit: { 
    type: DataTypes.DECIMAL(15, 2), 
    field: 'monthly_subsidy_limit' 
  },
  subsidyPercentage: { 
    type: DataTypes.INTEGER, 
    defaultValue: 100, 
    field: 'subsidy_percentage' 
  },
  canOrder: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true, 
    field: 'can_order' 
  },
  status: { 
    type: DataTypes.ENUM('active', 'inactive', 'suspended'), 
    defaultValue: 'active' 
  },
  joinedAt: { 
    type: DataTypes.DATEONLY, 
    defaultValue: DataTypes.NOW, 
    field: 'joined_at' 
  }
}, { 
  tableName: 'employees', 
  timestamps: true, 
  createdAt: 'created_at', 
  updatedAt: 'updated_at' 
});

module.exports = Employee;
