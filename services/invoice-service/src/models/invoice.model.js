const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    field: 'invoice_number'
  },
  type: {
    type: DataTypes.ENUM('instant', 'consolidated', 'proforma'),
    allowNull: false,
    defaultValue: 'instant'
  },
  status: {
    type: DataTypes.ENUM('draft', 'issued', 'sent', 'paid', 'cancelled'),
    defaultValue: 'draft'
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id'
  },
  companyId: {
    type: DataTypes.UUID,
    field: 'company_id'
  },
  periodStart: {
    type: DataTypes.DATEONLY,
    field: 'period_start'
  },
  periodEnd: {
    type: DataTypes.DATEONLY,
    field: 'period_end'
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 9,
    field: 'tax_rate'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'tax_amount'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_amount'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'paid_amount'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    field: 'due_date'
  },
  paidAt: {
    type: DataTypes.DATE,
    field: 'paid_at'
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    field: 'pdf_url'
  },
  notes: {
    type: DataTypes.TEXT
  },
  // Additional metadata
  customerName: {
    type: DataTypes.STRING(255),
    field: 'customer_name'
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    field: 'customer_email'
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    field: 'customer_phone'
  },
  customerAddress: {
    type: DataTypes.TEXT,
    field: 'customer_address'
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  underscored: true
});

module.exports = Invoice;
