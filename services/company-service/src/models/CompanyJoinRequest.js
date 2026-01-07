const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * CompanyJoinRequest Model
 * مدل درخواست عضویت در شرکت
 */
const CompanyJoinRequest = sequelize.define('CompanyJoinRequest', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false, 
    field: 'user_id' 
  },
  companyId: { 
    type: DataTypes.UUID, 
    allowNull: false, 
    field: 'company_id' 
  },
  status: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected'), 
    defaultValue: 'pending' 
  },
  message: { 
    type: DataTypes.TEXT,
    comment: 'پیام کاربر برای درخواست عضویت'
  },
  reviewedBy: { 
    type: DataTypes.UUID, 
    field: 'reviewed_by',
    comment: 'شناسه کاربری که درخواست را بررسی کرده'
  },
  reviewedAt: { 
    type: DataTypes.DATE, 
    field: 'reviewed_at' 
  },
  rejectionReason: { 
    type: DataTypes.TEXT, 
    field: 'rejection_reason' 
  }
}, { 
  tableName: 'company_join_requests', 
  timestamps: true, 
  createdAt: 'created_at', 
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id', 'company_id'], unique: true, where: { status: 'pending' } },
    { fields: ['company_id', 'status'] },
    { fields: ['user_id'] }
  ]
});

module.exports = CompanyJoinRequest;
