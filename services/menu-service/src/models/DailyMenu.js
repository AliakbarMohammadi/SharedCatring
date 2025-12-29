const mongoose = require('mongoose');

const dailyMenuItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  maxQuantity: {
    type: Number,
    default: null // null means unlimited
  },
  remainingQuantity: {
    type: Number,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const dailyMenuSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  companyId: {
    type: String, // UUID from company service
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  items: [dailyMenuItemSchema],
  orderDeadline: {
    type: Date,
    required: true
  },
  deliveryTime: {
    start: { type: String, default: '12:00' },
    end: { type: String, default: '13:00' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for unique daily menu per company/date/meal
dailyMenuSchema.index({ companyId: 1, date: 1, mealType: 1 }, { unique: true });
dailyMenuSchema.index({ date: 1, isActive: 1 });
dailyMenuSchema.index({ companyId: 1, isActive: 1 });

// Method to check if ordering is still allowed
dailyMenuSchema.methods.canOrder = function() {
  return new Date() < new Date(this.orderDeadline) && this.isActive;
};

// Method to check item availability
dailyMenuSchema.methods.isItemAvailable = function(menuItemId) {
  const item = this.items.find(i => i.menuItemId.toString() === menuItemId.toString());
  if (!item || !item.isAvailable) return false;
  if (item.remainingQuantity !== null && item.remainingQuantity <= 0) return false;
  return true;
};

module.exports = mongoose.model('DailyMenu', dailyMenuSchema);
