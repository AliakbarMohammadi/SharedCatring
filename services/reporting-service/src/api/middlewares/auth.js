const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../../utils/logger');

/**
 * Extract user info from headers (set by API Gateway) or JWT token
 */
const extractUser = (req, res, next) => {
  // First try to get user from headers (set by API Gateway)
  if (req.headers['x-user-id']) {
    req.user = {
      id: req.headers['x-user-id'],
      role: req.headers['x-user-role'] || 'user',
      companyId: req.headers['x-company-id'] || null
    };
    return next();
  }

  // Otherwise, try to verify JWT token directly
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        id: decoded.userId,
        role: decoded.role || 'user',
        companyId: decoded.companyId || null
      };
    } catch (error) {
      logger.debug('خطا در تأیید توکن', { error: error.message });
      req.user = { id: null, role: 'user', companyId: null };
    }
  } else {
    req.user = { id: null, role: 'user', companyId: null };
  }
  
  next();
};

/**
 * Require authenticated user
 */
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_UNAUTHORIZED',
        message: 'برای دسترسی به این بخش باید وارد شوید',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }
  next();
};

/**
 * Admin roles that have full access
 */
const ADMIN_ROLES = ['admin', 'super_admin', 'catering_admin'];

/**
 * Require admin role (super_admin, admin, catering_admin)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
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

/**
 * Require admin or company admin role
 */
const requireAdminOrCompanyAdmin = (req, res, next) => {
  const allowedRoles = [...ADMIN_ROLES, 'company_admin', 'company_manager'];
  
  if (!req.user || !allowedRoles.includes(req.user.role)) {
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

/**
 * Check company access
 */
const checkCompanyAccess = (req, res, next) => {
  const companyId = req.params.id || req.query.companyId;
  
  // Super admin and admin can access all companies
  if (ADMIN_ROLES.includes(req.user.role)) {
    return next();
  }
  
  // Company admin/manager can only access their own company
  if (['company_admin', 'company_manager'].includes(req.user.role)) {
    if (req.user.companyId === companyId) {
      return next();
    }
  }
  
  return res.status(403).json({
    success: false,
    error: {
      code: 'ERR_FORBIDDEN',
      message: 'شما دسترسی به اطلاعات این شرکت را ندارید',
      details: [],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  extractUser,
  requireAuth,
  requireAdmin,
  requireAdminOrCompanyAdmin,
  checkCompanyAccess,
  ADMIN_ROLES
};
