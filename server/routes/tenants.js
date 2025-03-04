const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const TenantService = require('../services/TenantService');
const auth = require('../middleware/auth');
const { requireFeature } = require('../middleware/tenantMiddleware');

// @route   POST api/tenants
// @desc    Create a new tenant
// @access  Public
router.post('/',
  [
    check('name', 'Name is required').notEmpty(),
    check('subdomain', 'Subdomain is required').notEmpty(),
    check('contact.email', 'Valid email is required').isEmail(),
    check('plan').isIn(['basic', 'professional', 'enterprise'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tenant = await TenantService.createTenant(req.body);
      res.status(201).json(tenant);
    } catch (error) {
      console.error('Error in tenant creation:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT api/tenants/:id/plan
// @desc    Update tenant's plan
// @access  Private/Admin
router.put('/:id/plan',
  [
    auth,
    check('plan').isIn(['basic', 'professional', 'enterprise'])
  ],
  async (req, res) => {
    try {
      const tenant = await TenantService.updateTenantPlan(
        req.params.id,
        req.body.plan
      );
      res.json(tenant);
    } catch (error) {
      console.error('Error updating tenant plan:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   GET api/tenants/:id/analytics
// @desc    Get tenant analytics
// @access  Private/Admin
router.get('/:id/analytics',
  [auth, requireFeature('analytics')],
  async (req, res) => {
    try {
      const analytics = await TenantService.getTenantAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching tenant analytics:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   DELETE api/tenants/:id
// @desc    Suspend a tenant
// @access  Private/Admin
router.delete('/:id',
  auth,
  async (req, res) => {
    try {
      await TenantService.suspendTenant(req.params.id);
      res.json({ message: 'Tenant suspended successfully' });
    } catch (error) {
      console.error('Error suspending tenant:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router; 