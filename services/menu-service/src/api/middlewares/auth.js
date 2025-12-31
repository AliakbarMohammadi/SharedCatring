/**
 * Extract user info from headers (set by API Gateway)
 */
const extractUser = (req, res, next) => {
  req.user = {
    userId: req.headers['x-user-id'],
    role: req.headers['x-user-role'],
    companyId: req.headers['x-company-id']
  };
  next();
};

/**
 * Require authentication
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
 * Admin only middleware
 */
const adminOnly = requireRole('super_admin', 'catering_admin');

/**
 * Kitchen staff and above
 */
const kitchenAccess = requireRole('super_admin', 'catering_admin', 'kitchen_staff');

module.exports = {
  extractUser,
  requireAuth,
  requireRole,
  adminOnly,
  kitchenAccess
};
