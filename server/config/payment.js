const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const env = require('./env');
const logger = require('./logger');

// Payment methods configuration
const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  WALLET: 'wallet'
};

// Currency configuration
const CURRENCIES = {
  USD: {
    code: 'usd',
    symbol: '$',
    minAmount: 50 // in cents
  },
  EUR: {
    code: 'eur',
    symbol: '€',
    minAmount: 50
  },
  GBP: {
    code: 'gbp',
    symbol: '£',
    minAmount: 30
  }
};

// Stripe configuration
const stripeConfig = {
  apiVersion: '2023-10-16',
  maxRetries: 3,
  timeout: 30000,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET
};

// Configure Stripe client
stripe.setApiVersion(stripeConfig.apiVersion);

// Create payment intent
const createPaymentIntent = async (amount, currency, paymentMethod, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      payment_method_types: [paymentMethod],
      metadata: {
        ...metadata,
        environment: env.NODE_ENV
      }
    });

    logger.info(`Payment intent created: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw error;
  }
};

// Create subscription
const createSubscription = async (customerId, priceId, metadata = {}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        ...metadata,
        environment: env.NODE_ENV
      }
    });

    logger.info(`Subscription created: ${subscription.id}`);
    return subscription;
  } catch (error) {
    logger.error('Error creating subscription:', error);
    throw error;
  }
};

// Create customer
const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        environment: env.NODE_ENV
      }
    });

    logger.info(`Customer created: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error('Error creating customer:', error);
    throw error;
  }
};

// Process refund
const processRefund = async (paymentIntentId, amount, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason
    });

    logger.info(`Refund processed: ${refund.id}`);
    return refund;
  } catch (error) {
    logger.error('Error processing refund:', error);
    throw error;
  }
};

// Verify webhook signature
const verifyWebhookSignature = (payload, signature) => {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeConfig.webhookSecret
    );
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    throw error;
  }
};

// Handle webhook events
const handleWebhookEvent = async (event) => {
  const eventHandlers = {
    'payment_intent.succeeded': handlePaymentSuccess,
    'payment_intent.payment_failed': handlePaymentFailure,
    'customer.subscription.created': handleSubscriptionCreated,
    'customer.subscription.updated': handleSubscriptionUpdated,
    'customer.subscription.deleted': handleSubscriptionCancelled,
    'invoice.payment_succeeded': handleInvoicePaymentSuccess,
    'invoice.payment_failed': handleInvoicePaymentFailure
  };

  const handler = eventHandlers[event.type];
  if (handler) {
    try {
      await handler(event.data.object);
    } catch (error) {
      logger.error(`Error handling webhook event ${event.type}:`, error);
      throw error;
    }
  } else {
    logger.warn(`Unhandled webhook event type: ${event.type}`);
  }
};

// Webhook event handlers
const handlePaymentSuccess = async (paymentIntent) => {
  logger.info(`Payment succeeded: ${paymentIntent.id}`);
  // Implement payment success logic
};

const handlePaymentFailure = async (paymentIntent) => {
  logger.warn(`Payment failed: ${paymentIntent.id}`);
  // Implement payment failure logic
};

const handleSubscriptionCreated = async (subscription) => {
  logger.info(`Subscription created: ${subscription.id}`);
  // Implement subscription creation logic
};

const handleSubscriptionUpdated = async (subscription) => {
  logger.info(`Subscription updated: ${subscription.id}`);
  // Implement subscription update logic
};

const handleSubscriptionCancelled = async (subscription) => {
  logger.info(`Subscription cancelled: ${subscription.id}`);
  // Implement subscription cancellation logic
};

const handleInvoicePaymentSuccess = async (invoice) => {
  logger.info(`Invoice payment succeeded: ${invoice.id}`);
  // Implement invoice payment success logic
};

const handleInvoicePaymentFailure = async (invoice) => {
  logger.warn(`Invoice payment failed: ${invoice.id}`);
  // Implement invoice payment failure logic
};

module.exports = {
  stripe,
  PAYMENT_METHODS,
  CURRENCIES,
  createPaymentIntent,
  createSubscription,
  createCustomer,
  processRefund,
  verifyWebhookSignature,
  handleWebhookEvent
}; 