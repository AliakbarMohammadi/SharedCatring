const bcrypt = require('bcryptjs');
const UAParser = require('ua-parser-js');
const config = require('../config');
const { Token, Session } = require('../models');
const tokenService = require('./token.service');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');

/**
 * Auth Service
 * سرویس احراز هویت
 */
class AuthService {
  /**
   * Hash password
   * @param {string} password
   * @returns {Promise<string>}
   */
  async hashPassword(password) {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  /**
   * Compare password with hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register new user
   * Note: This service only handles auth-related tasks.
   * User creation is handled by user-service via events.
   * @param {Object} userData
   * @param {Object} requestInfo
   * @returns {Promise<Object>}
   */
  async register(userData, requestInfo = {}) {
    const { email, phone, password, role = 'personal_user' } = userData;

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate user ID (will be used by user-service)
    const userId = require('uuid').v4();

    // Generate verification token
    const verifyToken = tokenService.generateRandomToken();
    await tokenService.saveVerifyToken(userId, verifyToken);

    // Publish registration event for user-service to create user
    await eventPublisher.publish('auth.user.registered', {
      userId,
      email,
      phone,
      password: hashedPassword,
      role,
      verifyToken,
      registeredAt: new Date().toISOString(),
      deviceInfo: this.parseDeviceInfo(requestInfo)
    });

    logger.info('کاربر جدید ثبت‌نام کرد', { userId, email });

    return {
      userId,
      email,
      verifyToken // In production, this would be sent via email
    };
  }

  /**
   * Login user
   * @param {Object} credentials
   * @param {Object} userFromService - User data from user-service
   * @param {Object} requestInfo
   * @returns {Promise<Object>}
   */
  async login(credentials, userFromService, requestInfo = {}) {
    const { password } = credentials;

    // Verify password
    const isValidPassword = await this.comparePassword(password, userFromService.password);
    if (!isValidPassword) {
      logger.warn('رمز عبور نادرست', { email: userFromService.email });
      throw {
        statusCode: 401,
        code: 'ERR_INVALID_CREDENTIALS',
        message: 'ایمیل یا رمز عبور اشتباه است'
      };
    }

    // Check if user is active
    if (!userFromService.isActive) {
      throw {
        statusCode: 403,
        code: 'ERR_USER_INACTIVE',
        message: 'حساب کاربری شما غیرفعال شده است'
      };
    }

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(userFromService);

    // Create session
    const session = await this.createSession(
      userFromService.id || userFromService._id,
      tokens.refreshToken,
      requestInfo
    );

    // Publish login event
    await eventPublisher.publish('auth.user.logged_in', {
      userId: userFromService.id || userFromService._id,
      email: userFromService.email,
      sessionId: session._id.toString(),
      loginAt: new Date().toISOString(),
      deviceInfo: session.deviceInfo
    });

    logger.info('کاربر وارد شد', { 
      userId: userFromService.id || userFromService._id, 
      email: userFromService.email 
    });

    return {
      ...tokens,
      user: {
        id: userFromService.id || userFromService._id,
        email: userFromService.email,
        firstName: userFromService.firstName,
        lastName: userFromService.lastName,
        role: userFromService.role,
        companyId: userFromService.companyId
      }
    };
  }

  /**
   * Refresh access token
   * @param {string} refreshToken
   * @param {Object} requestInfo
   * @returns {Promise<Object>}
   */
  async refreshToken(refreshToken, requestInfo = {}) {
    // Validate refresh token
    const tokenDoc = await tokenService.validateRefreshToken(refreshToken);
    if (!tokenDoc) {
      throw {
        statusCode: 401,
        code: 'ERR_INVALID_REFRESH_TOKEN',
        message: 'توکن نامعتبر یا منقضی شده است'
      };
    }

    // Find session
    const session = await Session.findByRefreshToken(refreshToken);
    if (!session) {
      throw {
        statusCode: 401,
        code: 'ERR_SESSION_NOT_FOUND',
        message: 'نشست یافت نشد. لطفاً دوباره وارد شوید'
      };
    }

    // Revoke old refresh token
    await tokenDoc.revoke();

    // Generate new tokens
    const newRefreshToken = tokenService.generateRefreshToken();
    const accessToken = tokenService.generateAccessToken({
      userId: tokenDoc.userId,
      // Note: In production, fetch user data from user-service
    });

    // Save new refresh token
    await tokenService.saveRefreshToken(tokenDoc.userId, newRefreshToken);

    // Update session
    session.refreshToken = newRefreshToken;
    await session.updateActivity();

    logger.debug('توکن تمدید شد', { userId: tokenDoc.userId });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: tokenService.parseExpiresIn(config.jwt.accessExpiresIn)
    };
  }

  /**
   * Logout user
   * @param {string} userId
   * @param {string} refreshToken
   * @returns {Promise<void>}
   */
  async logout(userId, refreshToken) {
    // Revoke refresh token
    if (refreshToken) {
      await tokenService.revokeToken(refreshToken, 'refresh');
    }

    // Deactivate session
    const session = await Session.findByRefreshToken(refreshToken);
    if (session) {
      await session.deactivate();
    }

    // Publish logout event
    await eventPublisher.publish('auth.user.logged_out', {
      userId,
      logoutAt: new Date().toISOString()
    });

    logger.info('کاربر خارج شد', { userId });
  }

  /**
   * Logout from all devices
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async logoutAll(userId) {
    // Revoke all refresh tokens
    await tokenService.revokeAllUserTokens(userId, 'refresh');

    // Deactivate all sessions
    await Session.deactivateAllUserSessions(userId);

    logger.info('کاربر از همه دستگاه‌ها خارج شد', { userId });
  }

  /**
   * Request password reset
   * @param {string} email
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async forgotPassword(email, userId) {
    // Generate reset token
    const resetToken = tokenService.generateRandomToken();
    await tokenService.saveResetToken(userId, resetToken);

    // Generate reset link
    const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    // Publish event for notification service
    await eventPublisher.publish('auth.password.reset_requested', {
      userId,
      email,
      resetToken,
      resetLink,
      requestedAt: new Date().toISOString()
    });

    logger.info('درخواست بازیابی رمز عبور', { userId, email });

    return {
      resetToken, // In production, only send via email
      message: 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد'
    };
  }

  /**
   * Reset password
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  async resetPassword(token, newPassword) {
    // Validate reset token
    const tokenDoc = await tokenService.validateResetToken(token);
    if (!tokenDoc) {
      throw {
        statusCode: 400,
        code: 'ERR_INVALID_RESET_TOKEN',
        message: 'لینک بازیابی نامعتبر یا منقضی شده است'
      };
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Revoke reset token
    await tokenDoc.revoke();

    // Revoke all refresh tokens (force re-login)
    await tokenService.revokeAllUserTokens(tokenDoc.userId, 'refresh');

    // Deactivate all sessions
    await Session.deactivateAllUserSessions(tokenDoc.userId);

    // Publish event for user-service to update password
    await eventPublisher.publish('auth.password.reset', {
      userId: tokenDoc.userId,
      newPassword: hashedPassword,
      resetAt: new Date().toISOString()
    });

    logger.info('رمز عبور بازنشانی شد', { userId: tokenDoc.userId });

    return {
      userId: tokenDoc.userId,
      message: 'رمز عبور با موفقیت تغییر کرد'
    };
  }

  /**
   * Verify access token
   * @param {string} token
   * @returns {Object|null}
   */
  verifyToken(token) {
    return tokenService.verifyAccessToken(token);
  }

  /**
   * Create session
   * @param {string} userId
   * @param {string} refreshToken
   * @param {Object} requestInfo
   * @returns {Promise<Session>}
   */
  async createSession(userId, refreshToken, requestInfo = {}) {
    const deviceInfo = this.parseDeviceInfo(requestInfo);

    const session = new Session({
      userId,
      refreshToken,
      deviceInfo,
      lastActivityAt: new Date()
    });

    await session.save();
    logger.debug('نشست جدید ایجاد شد', { userId, sessionId: session._id });
    return session;
  }

  /**
   * Parse device info from request
   * @param {Object} requestInfo
   * @returns {Object}
   */
  parseDeviceInfo(requestInfo) {
    const parser = new UAParser(requestInfo.userAgent || '');
    const result = parser.getResult();

    return {
      userAgent: requestInfo.userAgent || '',
      ip: requestInfo.ip || '',
      device: result.device.type || 'desktop',
      browser: result.browser.name || 'unknown',
      os: result.os.name || 'unknown'
    };
  }

  /**
   * Get user sessions
   * @param {string} userId
   * @returns {Promise<Session[]>}
   */
  async getUserSessions(userId) {
    return Session.getActiveSessions(userId);
  }
}

module.exports = new AuthService();
