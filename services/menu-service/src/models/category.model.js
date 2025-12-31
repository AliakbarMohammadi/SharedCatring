const mongoose = require('mongoose');
const { generateSlug } = require('../utils/helpers');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام دسته‌بندی الزامی است'],
    trim: true,
    maxlength: [100, 'نام دسته‌بندی نباید بیشتر از ۱۰۰ کاراکتر باشد']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد']
  },
  image: {
    type: String
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug before save
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = generateSlug(this.name) + '-' + Date.now().toString(36);
  }
  next();
});

// Virtual for children
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Category', categorySchema);
