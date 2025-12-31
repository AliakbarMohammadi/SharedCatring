const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  maxQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  remainingQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  specialPrice: {
    type: Number,
    default: null,
    min: 0
  }
}, { _id: false });

const menuScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'تاریخ الزامی است']
  },
  mealType: {
    type: String,
    enum: {
      values: ['breakfast', 'lunch', 'dinner'],
      message: 'نوع وعده باید یکی از breakfast، lunch یا dinner باشد'
    },
    required: [true, 'نوع وعده الزامی است']
  },
  items: [menuItemSchema],
  orderDeadline: {
    type: Date,
    required: [true, 'مهلت سفارش الزامی است']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound unique index for date + mealType
menuScheduleSchema.index({ date: 1, mealType: 1 }, { unique: true });
menuScheduleSchema.index({ isActive: 1, date: 1 });

// Static method to get today's menu
menuScheduleSchema.statics.getTodayMenu = async function(mealType = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const query = {
    date: { $gte: today, $lt: tomorrow },
    isActive: true
  };

  if (mealType) {
    query.mealType = mealType;
  }

  return this.find(query).populate('items.foodId');
};

// Static method to get weekly menu
menuScheduleSchema.statics.getWeeklyMenu = async function(startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return this.find({
    date: { $gte: start, $lt: end },
    isActive: true
  })
    .populate('items.foodId')
    .sort({ date: 1, mealType: 1 });
};

module.exports = mongoose.model('MenuSchedule', menuScheduleSchema);
