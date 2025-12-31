const mongoose = require('mongoose');
const { generateSlug } = require('../utils/helpers');

const corporatePriceSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { _id: false });

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbohydrates: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 }
}, { _id: false });

const attributesSchema = new mongoose.Schema({
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  isSpicy: { type: Boolean, default: false },
  spicyLevel: { type: Number, default: 0, min: 0, max: 5 },
  servingSize: { type: String },
  preparationTime: { type: Number, default: 0 }
}, { _id: false });

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام غذا الزامی است'],
    trim: true,
    maxlength: [200, 'نام غذا نباید بیشتر از ۲۰۰ کاراکتر باشد']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [1000, 'توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'دسته‌بندی الزامی است']
  },
  images: [{
    type: String
  }],
  thumbnailImage: {
    type: String
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'قیمت پایه الزامی است'],
      min: [0, 'قیمت نمی‌تواند منفی باشد']
    },
    discountedPrice: {
      type: Number,
      default: null,
      min: 0
    },
    corporatePrices: [corporatePriceSchema]
  },
  nutrition: nutritionSchema,
  attributes: attributesSchema,
  allergens: [{
    type: String,
    trim: true
  }],
  ingredients: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug before save
foodItemSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = generateSlug(this.name) + '-' + Date.now().toString(36);
  }
  next();
});

// Indexes
foodItemSchema.index({ slug: 1 });
foodItemSchema.index({ categoryId: 1 });
foodItemSchema.index({ isAvailable: 1 });
foodItemSchema.index({ isFeatured: 1 });
foodItemSchema.index({ 'pricing.basePrice': 1 });
foodItemSchema.index({ 'rating.average': -1 });
foodItemSchema.index({ tags: 1 });
foodItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);
