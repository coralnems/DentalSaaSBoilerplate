const Joi = require('joi');

const tenantSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .trim(),
  
  subdomain: Joi.string()
    .required()
    .min(3)
    .max(63)
    .lowercase()
    .trim()
    .pattern(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/),
  
  plan: Joi.string()
    .valid('basic', 'professional', 'enterprise')
    .default('basic'),

  settings: Joi.object({
    businessHours: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      workingDays: Joi.array().items(
        Joi.string().valid(
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        )
      ),
    }),
    appointmentDuration: Joi.number().min(5).max(480),
    currency: Joi.string().length(3),
    timezone: Joi.string(),
    language: Joi.string().length(2),
    dateFormat: Joi.string(),
    timeFormat: Joi.string().valid('12h', '24h'),
  }),

  customization: Joi.object({
    logo: Joi.string().uri(),
    favicon: Joi.string().uri(),
    colors: Joi.object({
      primary: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      secondary: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      accent: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    }),
    fonts: Joi.object({
      primary: Joi.string(),
      secondary: Joi.string(),
    }),
    layout: Joi.object({
      sidebarPosition: Joi.string().valid('left', 'right'),
      theme: Joi.string().valid('light', 'dark', 'system'),
    }),
  }),

  features: Joi.object({
    insurance: Joi.boolean(),
    onlineBooking: Joi.boolean(),
    smsReminders: Joi.boolean(),
    analytics: Joi.boolean(),
    multipleLocations: Joi.boolean(),
    patientPortal: Joi.boolean(),
    teledentistry: Joi.boolean(),
    inventory: Joi.boolean(),
  }),

  billing: Joi.object({
    provider: Joi.string().valid('stripe', 'lemonsqueezy', 'paddle', 'chargebee', 'custom'),
    providers: Joi.object({
      stripe: Joi.object({
        customerId: Joi.string(),
        subscriptionId: Joi.string(),
        priceId: Joi.string(),
      }),
      lemonsqueezy: Joi.object({
        customerId: Joi.string(),
        subscriptionId: Joi.string(),
        variantId: Joi.string(),
      }),
      paddle: Joi.object({
        customerId: Joi.string(),
        subscriptionId: Joi.string(),
        planId: Joi.string(),
      }),
      chargebee: Joi.object({
        customerId: Joi.string(),
        subscriptionId: Joi.string(),
        planId: Joi.string(),
      }),
    }),
    status: Joi.string().valid('active', 'past_due', 'canceled', 'trialing'),
    trialEndsAt: Joi.date(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    currentPeriodStart: Joi.date(),
    currentPeriodEnd: Joi.date(),
    cancelAtPeriodEnd: Joi.boolean(),
  }),

  contact: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zip: Joi.string(),
      country: Joi.string(),
    }),
    technicalContact: Joi.object({
      name: Joi.string(),
      email: Joi.string().email(),
      phone: Joi.string(),
    }),
    billingContact: Joi.object({
      name: Joi.string(),
      email: Joi.string().email(),
      phone: Joi.string(),
    }),
  }),

  security: Joi.object({
    mfa: Joi.boolean(),
    passwordPolicy: Joi.object({
      minLength: Joi.number().min(8).max(128),
      requireNumbers: Joi.boolean(),
      requireSymbols: Joi.boolean(),
      requireUppercase: Joi.boolean(),
      expiryDays: Joi.number(),
    }),
    ipWhitelist: Joi.array().items(
      Joi.string().ip({
        version: ['ipv4', 'ipv6'],
        cidr: 'optional',
      })
    ),
    sessionTimeout: Joi.number(),
  }),

  metadata: Joi.object().pattern(
    Joi.string(),
    Joi.string()
  ),
}).unknown(true);

const validateTenant = (data) => {
  return tenantSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateTenant,
}; 