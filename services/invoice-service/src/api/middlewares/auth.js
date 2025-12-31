// Extract user info from headers (set by API Gateway)
const extractUser = (req, res, next) => {
  req.user = {
    id: req.headers['x-user-id'] || null,
    role: req.headers['x-user-role'] || 'user',
    companyId: req.headers['x-company-id'] || null
  };
  next();
};

// Require authenticated user
const requireAuth = (req, res, next) => {
  if (!req.user?.id) {
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

// Require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user?.id) {
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
  
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ERR_FORBIDDEN',
        message: 'دسترسی غیرمجاز',
        details: [],
        timestamp: new Date().toISOString()
      }
    });
  }
  next();
};

// Require company admin access
const companyAdminAccess = (req, res, next) => {
  const companyId = req.params.companyId || req.body.companyId;
  
  if (!req.user?.id) {
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
  
  // Super admin can access all
  if (['admin', 'super_admin'].includes(req.user.role)) {
    return next();
  }
  
  // Company admin can only access their company
  if (req.user.role === 'company_admin' && req.user.companyId === companyId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: {
      code: 'ERR_FORBIDDEN',
      message: 'دسترسی به این شرکت مجاز نیست',
      details: [],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  extractUser,
  requireAuth,
  requireAdmin,
  companyAdminAccess
};
