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

module.exports = {
  extractUser,
  requireAuth,
  requireAdmin
};
