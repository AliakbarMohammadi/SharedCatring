const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    field: 'order_id'
  },
  invoiceId: {
    type: DataTypes.UUID,
    field: 'invoice_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending'
  },
  method: {
    type: DataTypes.ENUM('online', 'wallet', 'card', 'cash'),
    defaultValue: 'online'
  },
  gateway: {
    type: DataTypes.STRING(50)
  },
  gatewayRef: {
    type: DataTypes.STRING(100),
    field: 'gateway_ref'
  },
  gatewayResponse: {
    type: DataTypes.JSONB,
    field: 'gateway_response'
  },
  trackingCode: {
    type: DataTypes.STRING(50),
    unique: true,
    field: 'tracking_code'
  },
  description: {
    type: DataTypes.TEXT
  },
  paidAt: {
    type: DataTypes.DATE,
    field: 'paid_at'
  },
  refundedAt: {
    type: DataTypes.DATE,
    field: 'refunded_at'
  },
  refundAmount: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'refund_amount'
  },
  refundReason: {
    type: DataTypes.TEXT,
    field: 'refund_reason'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true
});

module.exports = Payment;
