const { authService, tokenService } = require('../../services');
const logger = require('../../utils/logger');

/**
 * Auth Controller
 * کنترلر احراز هویت
 */
class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, phone, password, role } = req.body;
      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('user-agent')
      };

      // Note: In production, check if email exists via user-service
      // For now, we'll handle this via events

      const result = await authService.register(
        { email, phone, password, role },
        requestInfo
      );

      res.status(201).json({
        success: true,
        data: {
          userId: result.userId,
          email: result.email
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

      // Note: In production, fetch user from user-service
      // For demo, we'll use a mock user or return error
      // This would typically be an HTTP call to user-service

      // Mock user for testing (remove in production)
      const mockUser = {
        id: 'mock-user-id',
        _id: 'mock-user-id',
        email: email,
        password: await authService.hashPassword('Test@123456'),
        firstName: 'کاربر',
        lastName: 'تست',
        role: 'personal_user',
        isActive: true
      };

      // In production, replace with:
      // const userResponse = await serviceClient.get(`${USER_SERVICE_URL}/internal/users/by-email/${email}`);
      // const user = userResponse.data;

      const result = await authService.login(
        { email, password },
        mockUser,
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

      // Note: In production, verify email exists via user-service
      // For demo, we'll use a mock user ID
      const mockUserId = 'mock-user-id';

      // In production:
      // const userResponse = await serviceClient.get(`${USER_SERVICE_URL}/internal/users/by-email/${email}`);
      // if (!userResponse.data) { return res.json({ success: true, ... }); } // Don't reveal if email exists

      const result = await authService.forgotPassword(email, mockUserId);

      // Always return success to prevent email enumeration
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
