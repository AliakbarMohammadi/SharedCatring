const extractUser = (req, res, next) => {
  req.user = {
    id: req.headers['x-user-id'] || null,
    role: req.headers['x-user-role'] || 'user',
    companyId: req.headers['x-company-id'] || null
  };
  next();
};

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
  
  if (['admin', 'super_admin'].includes(req.user.role)) {
    return next();
  }
  
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

// Internal API key validation
const validateInternalKey = (req, res, next) => {
  const internalKey = req.headers['x-internal-key'];
  
  // In production, validate against a secure key
  // For development, allow all internal calls
  if (process.env.NODE_ENV === 'development' || internalKey === process.env.INTERNAL_API_KEY) {
    return next();
  }
  
  // Also allow if user is authenticated (for testing)
  if (req.user?.id) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: {
      code: 'ERR_FORBIDDEN',
      message: 'دسترسی به API داخلی مجاز نیست',
      details: [],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  extractUser,
  requireAuth,
  requireAdmin,
  companyAdminAccess,
  validateInternalKey
};
