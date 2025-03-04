const User = require('../models/User');
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Check if req.user exists first
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user.active) {
        return res.status(403).json({ message: 'User account is inactive' });
      }

      if (user.role === 'admin') {
        return next();
      }

      if (!user.hasPermission(requiredPermission)) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action' 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

module.exports = checkPermission; 