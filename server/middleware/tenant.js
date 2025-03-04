const Tenant = require('../models/Tenant');
const User = require('../models/User');
const logger = require('../config/logger');
const AppError = require('./errorHandler').AppError;

// Extract tenant ID from request
const extractTenantId = (req) => {
  // Check header first
  const tenantId = req.headers['x-tenant-id'];
  if (tenantId) return tenantId;

  // Check subdomain
  const host = req.headers.host;
  if (host && host.includes('.')) {
    const subdomain = host.split('.')[0];
    if (subdomain !== 'www' && subdomain !== 'api') {
      return subdomain;
    }
  }

  // Check user's tenant
  return req.user?.tenantId;
};

// Tenant identification middleware
const identifyTenant = async (req, res, next) => {
  try {
    const tenantId = extractTenantId(req);
    
    if (!tenantId) {
      return next(new AppError('Tenant ID not found', 400));
    }

    // Find tenant and check if active
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }
    if (!tenant.isActive) {
      return next(new AppError('Tenant is inactive', 403));
    }

    // Attach tenant to request
    req.tenant = tenant;
    next();
  } catch (error) {
    logger.error('Tenant identification error:', error);
    next(new AppError('Error identifying tenant', 500));
  }
};

// Tenant access control middleware
const checkTenantAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const tenant = req.tenant;

    // Super admin can access all tenants
    if (user.role === 'superadmin') {
      return next();
    }

    // Check if user belongs to the tenant
    if (user.tenantId.toString() !== tenant._id.toString()) {
      logger.warn(`Unauthorized tenant access attempt by user ${user._id} for tenant ${tenant._id}`);
      return next(new AppError('Unauthorized tenant access', 403));
    }

    next();
  } catch (error) {
    logger.error('Tenant access check error:', error);
    next(new AppError('Error checking tenant access', 500));
  }
};

// Tenant data isolation middleware
const isolateTenantData = (req, res, next) => {
  // Add tenant filter to query
  if (req.query) {
    req.query.tenantId = req.tenant._id;
  }

  // Add tenant ID to body for create/update operations
  if (req.body && !req.body.tenantId) {
    req.body.tenantId = req.tenant._id;
  }

  next();
};

// Tenant resource limits middleware
const checkResourceLimits = async (req, res, next) => {
  try {
    const tenant = req.tenant;
    const resourceType = req.baseUrl.split('/').pop(); // e.g., 'users', 'patients'

    // Get current resource count
    const count = await getResourceCount(resourceType, tenant._id);
    
    // Check against tenant's plan limits
    if (tenant.plan.limits[resourceType] && count >= tenant.plan.limits[resourceType]) {
      return next(new AppError(`${resourceType} limit reached for tenant's plan`, 403));
    }

    next();
  } catch (error) {
    logger.error('Resource limit check error:', error);
    next(new AppError('Error checking resource limits', 500));
  }
};

// Helper function to get resource count
const getResourceCount = async (resourceType, tenantId) => {
  const resourceModels = {
    users: User,
    // Add other models as needed
  };

  const Model = resourceModels[resourceType];
  if (!Model) return 0;

  return await Model.countDocuments({ tenantId });
};

module.exports = {
  identifyTenant,
  checkTenantAccess,
  isolateTenantData,
  checkResourceLimits
}; 