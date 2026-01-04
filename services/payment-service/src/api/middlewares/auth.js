const jwt = require('jsonwebtoken');
const config = require('../../config');

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
      req.user = { id: null, role: 'user', companyId: null };
    }
  } else {
    req.user = { id: null, role: 'user', companyId: null };
  }
  
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
