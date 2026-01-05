/**
 * Auth Middleware for Identity Service
 * Reads user info from headers set by API Gateway
 */

/**
 * Extract user info from API Gateway headers
 */
const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const companyId = req.headers['x-company-id'];

  if (userId && userRole) {
    req.user = {
      userId,
      role: userRole,
      companyId: companyId || null
    };
  }

  next();
};

/**
 * Require authentication - fails if no user info in headers
 */
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId || !userRole) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_1003',
        message: 'برای دسترسی به این بخش باید وارد شوید',
        details: []
      }
    });
  }

  req.user = {
    userId,
    role: userRole,
    companyId: req.headers['x-company-id'] || null
  };

  next();
};

/**
 * Restrict access to specific roles
 * @param  {...string} allowedRoles - Roles that can access the route
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ERR_1003',
          message: 'برای دسترسی به این بخش باید وارد شوید',
          details: []
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ERR_1004',
          message: 'شما اجازه دسترسی به این بخش را ندارید',
          details: []
        }
      });
    }

    next();
  };
};

/**
 * Require super_admin role
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_1003',
        message: 'برای دسترسی به این بخش باید وارد شوید',
        details: []
      }
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ERR_1004',
        message: 'فقط مدیر ارشد سیستم به این بخش دسترسی دارد',
        details: []
      }
    });
  }

  next();
};

module.exports = {
  extractUser,
  requireAuth,
  restrictTo,
  requireSuperAdmin
};
