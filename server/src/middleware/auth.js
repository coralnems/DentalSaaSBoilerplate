const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT tokens
 * Supports both cookie-based and header-based authentication
 */
function authenticateJWT(req, res, next) {
  try {
    let token = null;
    
    // Check for token in cookies first (more secure)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } 
    // Fallback to Authorization header
    else if (req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    User.findById(decoded.id)
      .select('-password')
      .then(function(user) {
        if (!user) {
          return res.status(401).json({ message: 'Token is valid, but user no longer exists' });
        }
        
        // Add user to request object
        req.user = user;
        next();
      })
      .catch(function(err) {
        console.error('User lookup error:', err.message);
        res.status(401).json({ message: 'Error authenticating user' });
      });
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
}

/**
 * Authorization middleware to check user roles
 */
function authorizeRoles(roles) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required before authorization'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user.role} is not authorized to access this resource`,
      });
    }
    next();
  };
}

module.exports = { authenticateJWT, authorizeRoles }; 