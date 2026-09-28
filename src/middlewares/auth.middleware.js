const { verifyAccessToken } = require('../utils/jwt.util');

/**
 * Middleware to authenticate requests using JWT Access Tokens
 */
const authenticateToken = (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header: 'Bearer <token>'
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Check cookies fallback
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'NO_TOKEN_PROVIDED',
        message: 'Authentication required. Please log in to access this resource.',
      });
    }

    // Verify token
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Please refresh your token.',
        });
      }

      return res.status(403).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid access token.',
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: 'Internal server authentication error.',
    });
  }
};

/**
 * Optional authentication middleware (attaches req.user if token is valid, but does not block)
 */
const optionalAuth = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
      } catch {
        // Silently ignore invalid or expired token for optional routes
      }
    }
    return next();
  } catch {
    return next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
