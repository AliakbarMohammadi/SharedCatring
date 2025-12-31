const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_name'
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'file_name'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'mime_type'
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('image', 'document', 'spreadsheet', 'other'),
    defaultValue: 'other'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public'
  },
  hasThumbnail: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_thumbnail'
  },
  thumbnailPath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'thumbnail_path'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'uploaded_by'
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'company_id'
  },
  referenceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'reference_type'
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reference_id'
  }
}, {
  tableName: 'files',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['uploaded_by'] },
    { fields: ['company_id'] },
    { fields: ['reference_type', 'reference_id'] },
    { fields: ['category'] },
    { fields: ['created_at'] }
  ]
});

module.exports = File;
