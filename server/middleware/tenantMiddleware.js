const Tenant = require('../models/Tenant');

async function resolveTenant(req, res, next) {
  try {
    // Get tenant from subdomain
    const host = req.get('host');
    const subdomain = host.split('.')[0];
    
    if (subdomain === 'www' || subdomain === 'api') {
      return next();
    }

    const tenant = await Tenant.findOne({ subdomain });
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant.subscription.status !== 'active') {
      return res.status(403).json({ message: 'Subscription is not active' });
    }

    // Attach tenant to request
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function requireFeature(feature) {
  return async (req, res, next) => {
    if (!req.tenant) {
      return res.status(400).json({ message: 'Tenant context required' });
    }

    if (!req.tenant.features[feature]) {
      return res.status(403).json({ 
        message: `This feature (${feature}) is not available in your current plan` 
      });
    }

    next();
  };
}

module.exports = {
  resolveTenant,
  requireFeature
}; 