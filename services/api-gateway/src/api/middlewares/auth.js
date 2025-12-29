const jwt = require('jsonwebtoken');
const config = require('../../config');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_1003',
        message: 'برای دسترسی به این بخش باید وارد شوید',
        details: []
      }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-company-id'] = decoded.companyId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ERR_1101',
          message: 'توکن منقضی شده است. لطفاً دوباره وارد شوید',
          details: []
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_1102',
        message: 'توکن نامعتبر است',
        details: []
      }
    });
  }
};

const authorize = (...roles) => {
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

    if (!roles.includes(req.user.role)) {
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

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-company-id'] = decoded.companyId;
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
