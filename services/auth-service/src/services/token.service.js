const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const { Token } = require('../models');
const logger = require('../utils/logger');

/**
 * Token Service
 * سرویس مدیریت توکن
 */
class TokenService {
  /**
   * Generate access token
   * @param {Object} payload - Token payload
   * @returns {string}
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn
    });
  }

  /**
   * Generate refresh token
   * @returns {string}
   */
  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generate random token (for reset/verify)
   * @returns {string}
   */
  generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify access token
   * @param {string} token
   * @returns {Object|null}
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      logger.debug('خطا در تأیید توکن:', { error: error.message });
      return null;
    }
  }

  /**
   * Decode token without verification
   * @param {string} token
   * @returns {Object|null}
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save refresh token to database
   * @param {string} userId
   * @param {string} token
   * @returns {Promise<Token>}
   */
  async saveRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const tokenDoc = new Token({
      userId,
      token,
      type: 'refresh',
      expiresAt
    });

    await tokenDoc.save();
    logger.debug('توکن refresh ذخیره شد', { userId });
    return tokenDoc;
  }

  /**
   * Save reset token to database
   * @param {string} userId
   * @param {string} token
   * @returns {Promise<Token>}
   */
  async saveResetToken(userId, token) {
    // Revoke any existing reset tokens
    await Token.revokeUserTokens(userId, 'reset');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    const tokenDoc = new Token({
      userId,
      token,
      type: 'reset',
      expiresAt
    });

    await tokenDoc.save();
    logger.debug('توکن reset ذخیره شد', { userId });
    return tokenDoc;
  }

  /**
   * Save verification token to database
   * @param {string} userId
   * @param {string} token
   * @returns {Promise<Token>}
   */
  async saveVerifyToken(userId, token) {
    // Revoke any existing verify tokens
    await Token.revokeUserTokens(userId, 'verify');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    const tokenDoc = new Token({
      userId,
      token,
      type: 'verify',
      expiresAt
    });

    await tokenDoc.save();
    logger.debug('توکن verify ذخیره شد', { userId });
    return tokenDoc;
  }

  /**
   * Validate refresh token
   * @param {string} token
   * @returns {Promise<Token|null>}
   */
  async validateRefreshToken(token) {
    return Token.findValidToken(token, 'refresh');
  }

  /**
   * Validate reset token
   * @param {string} token
   * @returns {Promise<Token|null>}
   */
  async validateResetToken(token) {
    return Token.findValidToken(token, 'reset');
  }

  /**
   * Validate verify token
   * @param {string} token
   * @returns {Promise<Token|null>}
   */
  async validateVerifyToken(token) {
    return Token.findValidToken(token, 'verify');
  }

  /**
   * Revoke token
   * @param {string} token
   * @param {string} type
   * @returns {Promise<boolean>}
   */
  async revokeToken(token, type) {
    const tokenDoc = await Token.findOne({ token, type });
    if (tokenDoc) {
      await tokenDoc.revoke();
      logger.debug('توکن باطل شد', { type });
      return true;
    }
    return false;
  }

  /**
   * Revoke all user tokens
   * @param {string} userId
   * @param {string} type - Optional type filter
   */
  async revokeAllUserTokens(userId, type = null) {
    await Token.revokeUserTokens(userId, type);
    logger.debug('تمام توکن‌های کاربر باطل شد', { userId, type });
  }

  /**
   * Generate token pair (access + refresh)
   * @param {Object} user - User object
   * @returns {Promise<Object>}
   */
  async generateTokenPair(user) {
    const payload = {
      userId: user.id || user._id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken();

    // Save refresh token to database
    await this.saveRefreshToken(payload.userId, refreshToken);

    // Calculate expiry in seconds
    const expiresIn = this.parseExpiresIn(config.jwt.accessExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Parse expires in string to seconds
   * @param {string} expiresIn
   * @returns {number}
   */
  parseExpiresIn(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }
}

module.exports = new TokenService();
