const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * Extract user info from headers (set by API Gateway) or JWT token
 * استخراج اطلاعات کاربر از هدرها یا توکن JWT
 */
const extractUser = (req, res, next) => {
  // First check if API Gateway has set the headers
  if (req.headers['x-user-id']) {
    req.user = {
      userId: req.headers['x-user-id'],
      email: req.headers['x-user-email'],
      role: req.headers['x-user-role'],
      companyId: req.headers['x-company-id'] || null
    };
    return next();
  }

  // Otherwise, try to extract from JWT token
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role,
        companyId: decoded.companyId || null
      };
    } catch (error) {
      // Token invalid or expired - user will be null
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

/**
 * Require authentication
 * احراز هویت الزامی
 */
const requireAuth = (req, res, next) => {
  if (!req.user?.userId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_UNAUTHORIZED',
        message: 'احراز هویت الزامی است',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }
  next();
};

/**
 * Require specific roles
 * نیاز به نقش‌های خاص
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ERR_FORBIDDEN',
          message: 'شما دسترسی لازم برای این عملیات را ندارید',
          details: [],
          timestamp: new Date().toISOString()
        }
      });
    }
    next();
  };
};

/**
 * Admin only
 * فقط ادمین‌ها
 */
const adminOnly = requireRole('super_admin', 'catering_admin');

/**
 * Kitchen staff access
 * دسترسی پرسنل آشپزخانه
 */
const kitchenAccess = requireRole('super_admin', 'catering_admin', 'kitchen_staff');

/**
 * Company admin access
 * دسترسی مدیران شرکت
 */
const companyAdminAccess = requireRole('super_admin', 'catering_admin', 'company_admin', 'company_manager');

module.exports = {
  extractUser,
  requireAuth,
  requireRole,
  adminOnly,
  kitchenAccess,
  companyAdminAccess
};
