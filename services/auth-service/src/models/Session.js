const mongoose = require('mongoose');

/**
 * Session Schema
 * اسکیمای نشست
 */
const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  deviceInfo: {
    userAgent: {
      type: String,
      default: ''
    },
    ip: {
      type: String,
      default: ''
    },
    device: {
      type: String,
      default: 'unknown'
    },
    browser: {
      type: String,
      default: 'unknown'
    },
    os: {
      type: String,
      default: 'unknown'
    }
  },
  refreshToken: {
    type: String,
    index: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for user sessions
sessionSchema.index({ userId: 1, isActive: 1 });

/**
 * Update last activity
 */
sessionSchema.methods.updateActivity = async function() {
  this.lastActivityAt = new Date();
  await this.save();
};

/**
 * Deactivate session
 */
sessionSchema.methods.deactivate = async function() {
  this.isActive = false;
  await this.save();
};

/**
 * Get active sessions for user
 * @param {string} userId
 * @returns {Promise<Session[]>}
 */
sessionSchema.statics.getActiveSessions = async function(userId) {
  return this.find({ userId, isActive: true }).sort({ lastActivityAt: -1 });
};

/**
 * Deactivate all user sessions
 * @param {string} userId
 * @param {string} exceptSessionId - Session to keep active
 */
sessionSchema.statics.deactivateAllUserSessions = async function(userId, exceptSessionId = null) {
  const query = { userId, isActive: true };
  if (exceptSessionId) {
    query._id = { $ne: exceptSessionId };
  }
  await this.updateMany(query, { isActive: false });
};

/**
 * Find session by refresh token
 * @param {string} refreshToken
 * @returns {Promise<Session|null>}
 */
sessionSchema.statics.findByRefreshToken = async function(refreshToken) {
  return this.findOne({ refreshToken, isActive: true });
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
