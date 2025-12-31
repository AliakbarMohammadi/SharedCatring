const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'کد تخفیف الزامی است'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'کد تخفیف نباید بیشتر از ۲۰ کاراکتر باشد']
  },
  name: {
    type: String,
    required: [true, 'نام تخفیف الزامی است'],
    trim: true,
    maxlength: [100, 'نام تخفیف نباید بیشتر از ۱۰۰ کاراکتر باشد']
  },
  description: {
    type: String,
    maxlength: [500, 'توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد']
  },
  type: {
    type: String,
    enum: {
      values: ['percentage', 'fixed'],
      message: 'نوع تخفیف باید percentage یا fixed باشد'
    },
    required: [true, 'نوع تخفیف الزامی است']
  },
  value: {
    type: Number,
    required: [true, 'مقدار تخفیف الزامی است'],
    min: [0, 'مقدار تخفیف نمی‌تواند منفی باشد']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: 0
  },
  applicableItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  startDate: {
    type: Date,
    required: [true, 'تاریخ شروع الزامی است']
  },
  endDate: {
    type: Date,
    required: [true, 'تاریخ پایان الزامی است']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
promotionSchema.index({ code: 1 });
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Validate end date is after start date
promotionSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    const error = new Error('تاریخ پایان باید بعد از تاریخ شروع باشد');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

// Method to check if promotion is valid
promotionSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
};

// Method to calculate discount
promotionSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isValid()) return 0;
  if (orderAmount < this.minOrderAmount) return 0;

  let discount = 0;
  if (this.type === 'percentage') {
    discount = (orderAmount * this.value) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.value;
  }

  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Promotion', promotionSchema);
