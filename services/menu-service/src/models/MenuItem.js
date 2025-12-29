const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbohydrates: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 }
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameEn: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  images: [{
    type: String
  }],
  ingredients: [{
    name: String,
    amount: String
  }],
  allergens: [{
    type: String,
    enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'fish', 'shellfish', 'sesame']
  }],
  dietary: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free', 'dairy_free']
  }],
  nutrition: nutritionSchema,
  preparationTime: {
    type: Number, // in minutes
    default: 30
  },
  servingSize: {
    type: String,
    default: '۱ پرس'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  orderCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
menuItemSchema.index({ categoryId: 1, isActive: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', nameEn: 'text', description: 'text', tags: 'text' });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ 'rating.average': -1 });
menuItemSchema.index({ orderCount: -1 });

// Virtual for effective price
menuItemSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice && this.discountPrice < this.price 
    ? this.discountPrice 
    : this.price;
});

// Virtual for discount percentage
menuItemSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice && this.discountPrice < this.price) {
    return Math.round((1 - this.discountPrice / this.price) * 100);
  }
  return 0;
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
