/**
 * JWT Authentication Middleware
 * Protects admin routes and validates tokens
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'affiiate-admin-secret-key-change-in-production';

/**
 * Verify JWT token and attach user to request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Check if user has required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Generate refresh token for user
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'affiiate-refresh-secret-change-in-production',
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticateToken,
  requireRole,
  generateToken,
  generateRefreshToken,
  JWT_SECRET
};

