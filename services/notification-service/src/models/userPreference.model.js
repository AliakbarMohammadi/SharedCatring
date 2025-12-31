const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    enabled: { type: Boolean, default: true },
    address: { type: String }
  },
  sms: {
    enabled: { type: Boolean, default: true },
    phone: { type: String }
  },
  push: {
    enabled: { type: Boolean, default: true },
    deviceTokens: [{ type: String }]
  },
  inApp: {
    enabled: { type: Boolean, default: true }
  },
  categories: {
    order: { type: Boolean, default: true },
    payment: { type: Boolean, default: true },
    wallet: { type: Boolean, default: true },
    company: { type: Boolean, default: true },
    system: { type: Boolean, default: true },
    promotion: { type: Boolean, default: true }
  },
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' },
    end: { type: String, default: '08:00' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
