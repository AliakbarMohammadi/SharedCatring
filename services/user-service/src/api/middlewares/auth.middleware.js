// Extract user ID from headers (set by API Gateway after JWT validation)
const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
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

  req.userId = userId;
  req.userRole = req.headers['x-user-role'];
  req.companyId = req.headers['x-company-id'];
  
  next();
};

module.exports = { extractUser };
