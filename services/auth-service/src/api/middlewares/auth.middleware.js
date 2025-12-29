const { tokenService } = require('../../services');
const logger = require('../../utils/logger');

/**
 * JWT Authentication Middleware
 * میان‌افزار احراز هویت JWT
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_UNAUTHORIZED',
        message: 'برای دسترسی به این بخش باید وارد حساب کاربری خود شوید',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = tokenService.verifyAccessToken(token);

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

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('خطا در احراز هویت:', { error: error.message });

    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_INVALID_TOKEN',
        message: 'توکن نامعتبر است',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = tokenService.verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth
};
