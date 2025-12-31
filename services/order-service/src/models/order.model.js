const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    field: 'order_number'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  companyId: {
    type: DataTypes.UUID,
    field: 'company_id'
  },
  employeeId: {
    type: DataTypes.UUID,
    field: 'employee_id'
  },
  orderType: {
    type: DataTypes.ENUM('personal', 'corporate'),
    defaultValue: 'personal',
    field: 'order_type'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled', 'rejected'),
    defaultValue: 'pending'
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'discount_amount'
  },
  subsidyAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'subsidy_amount'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'tax_amount'
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'delivery_fee'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_amount'
  },
  userPayable: {
    type: DataTypes.DECIMAL(12, 2),
    field: 'user_payable'
  },
  companyPayable: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'company_payable'
  },
  deliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'delivery_date'
  },
  deliveryTimeSlot: {
    type: DataTypes.TIME,
    field: 'delivery_time_slot'
  },
  deliveryAddress: {
    type: DataTypes.JSONB,
    field: 'delivery_address'
  },
  deliveryNotes: {
    type: DataTypes.TEXT,
    field: 'delivery_notes'
  },
  promoCode: {
    type: DataTypes.STRING(50),
    field: 'promo_code'
  },
  notes: {
    type: DataTypes.TEXT
  },
  confirmedAt: {
    type: DataTypes.DATE,
    field: 'confirmed_at'
  },
  preparingAt: {
    type: DataTypes.DATE,
    field: 'preparing_at'
  },
  readyAt: {
    type: DataTypes.DATE,
    field: 'ready_at'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    field: 'delivered_at'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    field: 'cancelled_at'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    field: 'cancellation_reason'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true
});

module.exports = Order;
