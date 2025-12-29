const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
  roleId: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: 'role_id',
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  permissionId: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: 'permission_id',
    references: {
      model: 'permissions',
      key: 'id'
    }
  }
}, {
  tableName: 'role_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RolePermission;
