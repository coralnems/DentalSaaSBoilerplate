const Tenant = require('../models/Tenant');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class TenantService {
  static async createTenant(data) {
    try {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: data.contact.email,
        name: data.name,
        metadata: {
          tenantName: data.name
        }
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: this.getPlanPriceId(data.plan) }],
        metadata: {
          tenantName: data.name
        }
      });

      // Create tenant in database
      const tenant = new Tenant({
        ...data,
        subscription: {
          status: 'active',
          startDate: new Date(),
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id
        }
      });

      await tenant.save();
      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  static async updateTenantPlan(tenantId, newPlan) {
    try {
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) throw new Error('Tenant not found');

      // Update Stripe subscription
      await stripe.subscriptions.update(tenant.subscription.stripeSubscriptionId, {
        items: [{ price: this.getPlanPriceId(newPlan) }]
      });

      // Update tenant in database
      tenant.plan = newPlan;
      await tenant.save();
      return tenant;
    } catch (error) {
      console.error('Error updating tenant plan:', error);
      throw error;
    }
  }

  static async suspendTenant(tenantId) {
    try {
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) throw new Error('Tenant not found');

      // Cancel Stripe subscription
      await stripe.subscriptions.cancel(tenant.subscription.stripeSubscriptionId);

      // Update tenant status
      tenant.subscription.status = 'canceled';
      tenant.subscription.endDate = new Date();
      await tenant.save();
      return tenant;
    } catch (error) {
      console.error('Error suspending tenant:', error);
      throw error;
    }
  }

  static getPlanPriceId(plan) {
    const planPrices = {
      basic: process.env.STRIPE_BASIC_PLAN_PRICE_ID,
      professional: process.env.STRIPE_PRO_PLAN_PRICE_ID,
      enterprise: process.env.STRIPE_ENTERPRISE_PLAN_PRICE_ID
    };
    return planPrices[plan];
  }

  static async getTenantAnalytics(tenantId) {
    try {
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) throw new Error('Tenant not found');

      // Get subscription data from Stripe
      const subscription = await stripe.subscriptions.retrieve(
        tenant.subscription.stripeSubscriptionId
      );

      // Get invoice data
      const invoices = await stripe.invoices.list({
        customer: tenant.subscription.stripeCustomerId,
        limit: 12
      });

      return {
        subscription: {
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        },
        billing: {
          invoices: invoices.data.map(invoice => ({
            id: invoice.id,
            amount: invoice.amount_paid,
            status: invoice.status,
            date: new Date(invoice.created * 1000)
          }))
        }
      };
    } catch (error) {
      console.error('Error getting tenant analytics:', error);
      throw error;
    }
  }
}

module.exports = TenantService; 