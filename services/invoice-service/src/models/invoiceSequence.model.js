const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InvoiceSequence = sequelize.define('InvoiceSequence', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  prefix: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  lastSequence: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'last_sequence'
  }
}, {
  tableName: 'invoice_sequences',
  timestamps: true,
  underscored: true
});

module.exports = InvoiceSequence;
