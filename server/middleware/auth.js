const authService = require('../services/authService');
const { AppError } = require('./errorHandler');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');
const jwt = require('jsonwebtoken');

// Middleware to authenticate user using JWT
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new AppError(401, 'No token, authorization denied'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError(401, 'Invalid token'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Token expired'));
    }
    
    return next(new AppError(500, 'Server error'));
  }
};

// Middleware to verify MFA if enabled
const verifyMFA = async (req, res, next) => {
  try {
    const { user } = req;
    
    if (!user.mfaEnabled) {
      return next();
    }

    const mfaToken = req.header('X-MFA-Token');
    if (!mfaToken) {
      throw new AppError('MFA token required', 401);
    }

    const verified = await authService.verifyMFAToken(user._id, mfaToken);
    if (!verified) {
      throw new AppError('Invalid MFA token', 401);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check user role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Middleware to check user permissions
const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    
    const hasAllPermissions = requiredPermissions.every(permission =>
      req.user.role === 'admin' || userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return next(new AppError('You do not have the required permissions', 403));
    }

    next();
  };
};

// Middleware to verify tenant access
const verifyTenantAccess = async (req, res, next) => {
  try {
    const { user } = req;
    const tenantId = req.params.tenantId || req.body.tenantId;

    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    if (user.tenantId.toString() !== tenantId && user.role !== 'admin') {
      await createAuditLog({
        userId: user._id,
        action: 'UNAUTHORIZED_TENANT_ACCESS',
        resource: req.originalUrl,
        description: 'Attempted to access unauthorized tenant',
        tenantId: user.tenantId,
        severity: 'high'
      });

      return next(new AppError('You do not have access to this tenant', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  verifyMFA,
  checkRole,
  checkPermission,
  verifyTenantAccess,
  refreshToken
}; 