const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPreference = sequelize.define('UserPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id'
  },
  dietaryRestrictions: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
    field: 'dietary_restrictions'
  },
  allergies: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  favoriteFoods: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    field: 'favorite_foods'
  },
  notificationSettings: {
    type: DataTypes.JSONB,
    defaultValue: { email: true, sms: true, push: true },
    field: 'notification_settings'
  },
  language: {
    type: DataTypes.STRING(5),
    defaultValue: 'fa'
  }
}, {
  tableName: 'user_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserPreference;
