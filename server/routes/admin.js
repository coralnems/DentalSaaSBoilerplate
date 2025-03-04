const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Tenant = require('../models/Tenant');
const PaymentGatewayService = require('../services/paymentGateway');
const { createAuditLog, getAuditLogs } = require('../utils/auditLogger');
const { validateTenant } = require('../validation/tenantValidation');

// Protect all admin routes
router.use(adminAuth);

// Get all tenants
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find().select('-billing.providers');
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tenant by ID
router.get('/tenants/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new tenant
router.post('/tenants', async (req, res) => {
  try {
    const { error } = validateTenant(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const tenant = new Tenant(req.body);
    await tenant.save();

    await createAuditLog({
      userId: req.user._id,
      action: 'CREATE_TENANT',
      resource: `tenant/${tenant._id}`,
      details: { tenantName: tenant.name },
    });

    res.status(201).json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tenant
router.put('/tenants/:id', async (req, res) => {
  try {
    const { error } = validateTenant(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'UPDATE_TENANT',
      resource: `tenant/${tenant._id}`,
      details: { tenantName: tenant.name },
    });

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete tenant
router.delete('/tenants/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'DELETE_TENANT',
      resource: `tenant/${tenant._id}`,
      details: { tenantName: tenant.name },
    });

    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tenant settings
router.get('/tenants/:id/settings', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .select('settings customization features security');
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tenant settings
router.put('/tenants/:id/settings', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Update only allowed settings fields
    const allowedFields = ['settings', 'customization', 'features', 'security'];
    allowedFields.forEach(field => {
      if (req.body[field]) {
        tenant[field] = req.body[field];
      }
    });

    await tenant.save();

    await createAuditLog({
      userId: req.user._id,
      action: 'UPDATE_SETTINGS',
      resource: `tenant/${tenant._id}/settings`,
      details: { tenantName: tenant.name },
    });

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment gateway settings
router.get('/settings/payment-gateways', async (req, res) => {
  try {
    const tenants = await Tenant.find()
      .select('billing.provider billing.providers')
      .lean();

    const gatewaySettings = tenants.reduce((acc, tenant) => {
      const { provider, providers } = tenant.billing;
      if (!acc[provider]) {
        acc[provider] = providers[provider];
      }
      return acc;
    }, {});

    res.json(gatewaySettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment gateway settings
router.put('/settings/payment-gateways', async (req, res) => {
  try {
    const { provider, settings } = req.body;
    const tenants = await Tenant.find({ 'billing.provider': provider });

    for (const tenant of tenants) {
      tenant.billing.providers[provider] = settings;
      await tenant.save();
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'UPDATE_PAYMENT_GATEWAY',
      resource: `payment-gateway/${provider}`,
      details: { provider },
    });

    res.json({ message: 'Payment gateway settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle payment gateway webhooks
router.post('/webhooks/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const event = req.body;

    // Verify webhook signature based on provider
    // Implement signature verification for each provider

    const tenant = await Tenant.findOne({ 'billing.provider': provider });
    if (!tenant) {
      throw new Error('Tenant not found for webhook event');
    }

    const gatewayService = new PaymentGatewayService(tenant);
    await gatewayService.handleWebhook(provider, event);

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      action,
      resource,
      tenantId,
      page,
      limit,
    } = req.query;

    const logs = await getAuditLogs({
      startDate,
      endDate,
      userId,
      action,
      resource,
      tenantId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 