const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    // Fallback to Authorization Header if cookie is absent
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'NO_TOKEN',
        message: 'Authentication required. No access token provided.'
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Access token expired. Please refresh token.'
        });
      }
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid access token.'
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-password');
        if (user) req.user = user;
      } catch {
        // Ignore token errors for optional routes
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect, optionalAuth };
