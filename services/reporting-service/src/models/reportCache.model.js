const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// This model stores pre-computed report data for faster access
const ReportCache = sequelize.define('ReportCache', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'report_type'
  },
  reportKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'report_key'
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'generated_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at'
  }
}, {
  tableName: 'report_cache',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['report_type', 'report_key'], unique: true }
  ]
});

module.exports = ReportCache;
