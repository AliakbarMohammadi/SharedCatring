const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['email', 'sms'],
    required: true
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'wallet', 'company', 'system', 'promotion'],
    default: 'system'
  },
  subject: {
    type: String,
    required: function() { return this.type === 'email'; }
  },
  body: {
    type: String,
    required: true
  },
  variables: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);
