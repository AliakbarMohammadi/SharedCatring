const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'invoice_id',
    references: { model: 'invoices', key: 'id' }
  },
  orderId: {
    type: DataTypes.UUID,
    field: 'order_id'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_price'
  }
}, {
  tableName: 'invoice_items',
  timestamps: true,
  underscored: true
});

module.exports = InvoiceItem;
