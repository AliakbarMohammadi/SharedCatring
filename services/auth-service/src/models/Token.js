const mongoose = require('mongoose');

/**
 * Token Schema
 * اسکیمای توکن
 */
const tokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['refresh', 'reset', 'verify'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for cleanup of expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding user tokens
tokenSchema.index({ userId: 1, type: 1 });

/**
 * Check if token is expired
 * @returns {boolean}
 */
tokenSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

/**
 * Check if token is valid
 * @returns {boolean}
 */
tokenSchema.methods.isValid = function() {
  return !this.isRevoked && !this.isExpired();
};

/**
 * Revoke token
 */
tokenSchema.methods.revoke = async function() {
  this.isRevoked = true;
  await this.save();
};

/**
 * Find valid token
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token|null>}
 */
tokenSchema.statics.findValidToken = async function(token, type) {
  return this.findOne({
    token,
    type,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
};

/**
 * Revoke all user tokens of a type
 * @param {string} userId
 * @param {string} type
 */
tokenSchema.statics.revokeUserTokens = async function(userId, type = null) {
  const query = { userId, isRevoked: false };
  if (type) query.type = type;
  
  await this.updateMany(query, { isRevoked: true });
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
