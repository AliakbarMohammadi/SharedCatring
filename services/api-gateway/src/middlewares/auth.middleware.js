const jwt = require('jsonwebtoken');
const config = require('../config');
const { isPublicRoute } = require('../config/routes');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware
 * میان‌افزار احراز هویت JWT
 */
const authMiddleware = (req, res, next) => {
  // Check if route is public
  if (isPublicRoute(req.method, req.path)) {
    return next();
  }

  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('درخواست بدون توکن', { 
      path: req.path, 
      method: req.method,
      ip: req.ip 
    });

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
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach user info to request
    req.user = decoded;

    // Forward user info to downstream services via headers
    req.headers['x-user-id'] = decoded.userId || decoded.id;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role;
    
    if (decoded.companyId) {
      req.headers['x-company-id'] = decoded.companyId;
    }

    logger.debug('توکن تأیید شد', { 
      userId: decoded.userId || decoded.id,
      role: decoded.role 
    });

    next();
  } catch (error) {
    logger.warn('توکن نامعتبر', { 
      error: error.message,
      path: req.path 
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ERR_TOKEN_EXPIRED',
          message: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید',
          details: [],
          timestamp: new Date().toISOString()
        }
      });
    }

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
 * احراز هویت اختیاری
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    req.headers['x-user-id'] = decoded.userId || decoded.id;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role;
    
    if (decoded.companyId) {
      req.headers['x-company-id'] = decoded.companyId;
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
};

/**
 * Role-based authorization middleware
 * میان‌افزار مجوزدهی بر اساس نقش
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
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

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('دسترسی غیرمجاز', {
        userId: req.user.userId || req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'ERR_FORBIDDEN',
          message: 'شما اجازه دسترسی به این بخش را ندارید',
          details: [],
          timestamp: new Date().toISOString()
        }
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  authorize
};
