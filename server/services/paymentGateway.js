const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const { createAuditLog } = require('../utils/auditLogger');

class PaymentGatewayService {
  constructor(tenant) {
    this.tenant = tenant;
    this.provider = tenant.billing.provider;
  }

  async initializeProvider() {
    switch (this.provider) {
      case 'stripe':
        return this.initializeStripe();
      case 'lemonsqueezy':
        return this.initializeLemonSqueezy();
      case 'paddle':
        return this.initializePaddle();
      case 'chargebee':
        return this.initializeChargebee();
      default:
        throw new Error(`Unsupported payment provider: ${this.provider}`);
    }
  }

  async initializeStripe() {
    const { customerId, subscriptionId } = this.tenant.billing.providers.stripe;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: this.tenant.contact.email,
        name: this.tenant.name,
        metadata: {
          tenantId: this.tenant._id.toString(),
        },
      });
      this.tenant.billing.providers.stripe.customerId = customer.id;
      await this.tenant.save();
    }
    return true;
  }

  async initializeLemonSqueezy() {
    // Initialize LemonSqueezy integration
    const { apiKey, storeId } = this.tenant.billing.providers.lemonsqueezy;
    if (!apiKey || !storeId) {
      throw new Error('LemonSqueezy configuration is incomplete');
    }
    // Add initialization logic here
    return true;
  }

  async initializePaddle() {
    // Initialize Paddle integration
    const { vendorId, apiKey } = this.tenant.billing.providers.paddle;
    if (!vendorId || !apiKey) {
      throw new Error('Paddle configuration is incomplete');
    }
    // Add initialization logic here
    return true;
  }

  async initializeChargebee() {
    // Initialize Chargebee integration
    const { siteApiKey, siteName } = this.tenant.billing.providers.chargebee;
    if (!siteApiKey || !siteName) {
      throw new Error('Chargebee configuration is incomplete');
    }
    // Add initialization logic here
    return true;
  }

  async createSubscription(planId) {
    try {
      switch (this.provider) {
        case 'stripe':
          return await this.createStripeSubscription(planId);
        case 'lemonsqueezy':
          return await this.createLemonSqueezySubscription(planId);
        case 'paddle':
          return await this.createPaddleSubscription(planId);
        case 'chargebee':
          return await this.createChargebeeSubscription(planId);
        default:
          throw new Error(`Unsupported payment provider: ${this.provider}`);
      }
    } catch (error) {
      await createAuditLog({
        userId: this.tenant.contact.email,
        action: 'CREATE_SUBSCRIPTION_FAILED',
        resource: 'subscription',
        details: {
          provider: this.provider,
          planId,
          error: error.message,
        },
        tenantId: this.tenant._id,
      });
      throw error;
    }
  }

  async createStripeSubscription(planId) {
    const subscription = await stripe.subscriptions.create({
      customer: this.tenant.billing.providers.stripe.customerId,
      items: [{ price: planId }],
      metadata: {
        tenantId: this.tenant._id.toString(),
      },
    });

    this.tenant.billing.providers.stripe.subscriptionId = subscription.id;
    this.tenant.billing.status = subscription.status;
    await this.tenant.save();

    return subscription;
  }

  async createLemonSqueezySubscription(planId) {
    // Implement LemonSqueezy subscription creation
    throw new Error('Not implemented');
  }

  async createPaddleSubscription(planId) {
    // Implement Paddle subscription creation
    throw new Error('Not implemented');
  }

  async createChargebeeSubscription(planId) {
    // Implement Chargebee subscription creation
    throw new Error('Not implemented');
  }

  async cancelSubscription() {
    try {
      switch (this.provider) {
        case 'stripe':
          return await this.cancelStripeSubscription();
        case 'lemonsqueezy':
          return await this.cancelLemonSqueezySubscription();
        case 'paddle':
          return await this.cancelPaddleSubscription();
        case 'chargebee':
          return await this.cancelChargebeeSubscription();
        default:
          throw new Error(`Unsupported payment provider: ${this.provider}`);
      }
    } catch (error) {
      await createAuditLog({
        userId: this.tenant.contact.email,
        action: 'CANCEL_SUBSCRIPTION_FAILED',
        resource: 'subscription',
        details: {
          provider: this.provider,
          error: error.message,
        },
        tenantId: this.tenant._id,
      });
      throw error;
    }
  }

  async cancelStripeSubscription() {
    const subscriptionId = this.tenant.billing.providers.stripe.subscriptionId;
    if (!subscriptionId) {
      throw new Error('No active subscription found');
    }

    const subscription = await stripe.subscriptions.del(subscriptionId);
    this.tenant.billing.status = subscription.status;
    await this.tenant.save();

    return subscription;
  }

  async cancelLemonSqueezySubscription() {
    // Implement LemonSqueezy subscription cancellation
    throw new Error('Not implemented');
  }

  async cancelPaddleSubscription() {
    // Implement Paddle subscription cancellation
    throw new Error('Not implemented');
  }

  async cancelChargebeeSubscription() {
    // Implement Chargebee subscription cancellation
    throw new Error('Not implemented');
  }

  async handleWebhook(provider, event) {
    try {
      switch (provider) {
        case 'stripe':
          return await this.handleStripeWebhook(event);
        case 'lemonsqueezy':
          return await this.handleLemonSqueezyWebhook(event);
        case 'paddle':
          return await this.handlePaddleWebhook(event);
        case 'chargebee':
          return await this.handleChargebeeWebhook(event);
        default:
          throw new Error(`Unsupported webhook provider: ${provider}`);
      }
    } catch (error) {
      await createAuditLog({
        userId: this.tenant.contact.email,
        action: 'WEBHOOK_PROCESSING_FAILED',
        resource: 'webhook',
        details: {
          provider,
          event: event.type,
          error: error.message,
        },
        tenantId: this.tenant._id,
      });
      throw error;
    }
  }

  async handleStripeWebhook(event) {
    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleStripeSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleStripeSubscriptionCanceled(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleStripePaymentFailed(event.data.object);
        break;
    }
  }

  async handleLemonSqueezyWebhook(event) {
    // Implement LemonSqueezy webhook handling
    throw new Error('Not implemented');
  }

  async handlePaddleWebhook(event) {
    // Implement Paddle webhook handling
    throw new Error('Not implemented');
  }

  async handleChargebeeWebhook(event) {
    // Implement Chargebee webhook handling
    throw new Error('Not implemented');
  }

  async handleStripeSubscriptionUpdated(subscription) {
    this.tenant.billing.status = subscription.status;
    this.tenant.billing.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await this.tenant.save();
  }

  async handleStripeSubscriptionCanceled(subscription) {
    this.tenant.billing.status = 'canceled';
    this.tenant.billing.cancelAtPeriodEnd = true;
    await this.tenant.save();
  }

  async handleStripePaymentFailed(invoice) {
    this.tenant.billing.status = 'past_due';
    await this.tenant.save();

    // Notify tenant about payment failure
    // Implement notification logic here
  }
}

module.exports = PaymentGatewayService; 