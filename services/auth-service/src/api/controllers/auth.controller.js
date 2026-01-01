const { authService, tokenService } = require('../../services');
const { identityService } = require('../../utils/serviceClient');
const logger = require('../../utils/logger');

/**
 * Auth Controller - Production Ready
 * کنترلر احراز هویت - آماده تولید
 * 
 * تمام mock ها حذف شده و از سرویس Identity استفاده می‌شود
 */
class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, phone, password, firstName, lastName, role = 'personal_user' } = req.body;
      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('user-agent')
      };

      // Hash password
      const hashedPassword = await authService.hashPassword(password);

      // Create user in Identity Service (real database call)
      const user = await identityService.createUser({
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role
      });

      // Generate verification token
      const verifyToken = tokenService.generateRandomToken();
      await tokenService.saveVerifyToken(user.id, verifyToken);

      logger.info('کاربر جدید ثبت‌نام کرد', { userId: user.id, email });

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          email: user.email
        },
        message: 'ثبت‌نام با موفقیت انجام شد. لطفاً ایمیل خود را تأیید کنید'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('user-agent')
      };

      // Get user from Identity Service (real database call)
      const user = await identityService.getUserByEmail(email);
      
      if (!user) {
        throw {
          statusCode: 401,
          code: 'ERR_INVALID_CREDENTIALS',
          message: 'ایمیل یا رمز عبور اشتباه است'
        };
      }

      // Map identity service response to auth service format
      const userForAuth = {
        id: user.id,
        email: user.email,
        password: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name || 'personal_user',
        isActive: user.status === 'active',
        companyId: user.companyId
      };

      const result = await authService.login(
        { email, password },
        userForAuth,
        requestInfo
      );

      res.json({
        success: true,
        data: result,
        message: 'ورود با موفقیت انجام شد'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('user-agent')
      };

      const result = await authService.refreshToken(refreshToken, requestInfo);

      res.json({
        success: true,
        data: result,
        message: 'توکن با موفقیت تمدید شد'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.userId || req.headers['x-user-id'];

      await authService.logout(userId, refreshToken);

      res.json({
        success: true,
        data: null,
        message: 'خروج با موفقیت انجام شد'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      // Get user from Identity Service (real database call)
      const user = await identityService.getUserByEmail(email);

      // Always return success to prevent email enumeration
      if (user) {
        await authService.forgotPassword(email, user.id);
      }

      res.json({
        success: true,
        data: null,
        message: 'در صورت وجود حساب کاربری، لینک بازیابی رمز عبور به ایمیل شما ارسال خواهد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const result = await authService.resetPassword(token, password);

      // Update password in Identity Service
      if (result.userId) {
        const hashedPassword = await authService.hashPassword(password);
        await identityService.updateUserPassword(result.userId, hashedPassword);
      }

      res.json({
        success: true,
        data: null,
        message: 'رمز عبور با موفقیت تغییر کرد. لطفاً دوباره وارد شوید'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify token
   * POST /api/v1/auth/verify-token
   */
  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;

      const decoded = authService.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ERR_INVALID_TOKEN',
            message: 'توکن نامعتبر یا منقضی شده است',
            details: [],
            timestamp: new Date().toISOString()
          }
        });
      }

      res.json({
        success: true,
        data: {
          valid: true,
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          expiresAt: new Date(decoded.exp * 1000).toISOString()
        },
        message: 'توکن معتبر است'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user sessions
   * GET /api/v1/auth/sessions
   */
  async getSessions(req, res, next) {
    try {
      const userId = req.user?.userId || req.headers['x-user-id'];

      const sessions = await authService.getUserSessions(userId);

      res.json({
        success: true,
        data: sessions.map(session => ({
          id: session._id,
          device: session.deviceInfo.device,
          browser: session.deviceInfo.browser,
          os: session.deviceInfo.os,
          ip: session.deviceInfo.ip,
          lastActivity: session.lastActivityAt,
          createdAt: session.createdAt
        })),
        message: 'لیست نشست‌های فعال'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout from all devices
   * POST /api/v1/auth/logout-all
   */
  async logoutAll(req, res, next) {
    try {
      const userId = req.user?.userId || req.headers['x-user-id'];

      await authService.logoutAll(userId);

      res.json({
        success: true,
        data: null,
        message: 'از تمام دستگاه‌ها خارج شدید'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
