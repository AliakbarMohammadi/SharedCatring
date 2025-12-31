const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'wallet', 'company', 'system', 'promotion'],
    default: 'system'
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'read'],
    default: 'pending'
  },
  recipient: {
    email: String,
    phone: String,
    deviceToken: String
  },
  readAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  error: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
