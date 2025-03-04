const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No authentication token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      // Log unauthorized access attempt
      await createAuditLog({
        userId: user._id,
        action: 'UNAUTHORIZED_ADMIN_ACCESS',
        resource: req.originalUrl,
        details: 'Attempted to access admin route without proper permissions',
      });
      throw new Error('Not authorized to access admin routes');
    }

    // Add user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = adminAuth; 