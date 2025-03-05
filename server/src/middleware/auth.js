const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT tokens
 */
function authenticateJWT(req, res, next) {
  try {
    // Get token from header
    const token = req.header('Authorization') ? 
      req.header('Authorization').replace('Bearer ', '') : null;
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    User.findById(decoded.id)
      .select('-password')
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Token is valid, but user no longer exists' });
        }
        
        // Add user to request object
        req.user = user;
        next();
      })
      .catch(err => {
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
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user.role} is not authorized to access this resource`,
      });
    }
    next();
  };
}

module.exports = { authenticateJWT, authorizeRoles }; 