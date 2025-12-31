const logger = require('../../utils/logger');

/**
 * Extract user info from headers (set by API Gateway)
 */
const extractUser = (req, res, next) => {
  req.user = {
    id: req.headers['x-user-id'] || null,
    role: req.headers['x-user-role'] || 'user',
    companyId: req.headers['x-company-id'] || null
  };
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
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
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
  if (!req.user || !['admin', 'company_admin'].includes(req.user.role)) {
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
  const { id: companyId } = req.params;
  
  // Admin can access all companies
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Company admin can only access their own company
  if (req.user.role === 'company_admin' && req.user.companyId === companyId) {
    return next();
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
  checkCompanyAccess
};
