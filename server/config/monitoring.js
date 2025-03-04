const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const env = require('./env');
const logger = require('./logger');

// Initialize Sentry
const initializeSentry = () => {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      integrations: [
        new ProfilingIntegration()
      ],
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
      maxBreadcrumbs: 50,
      debug: env.NODE_ENV === 'development',
      beforeSend: (event) => sanitizeEventData(event)
    });

    logger.info('Sentry initialized successfully');
  } else {
    logger.warn('Sentry DSN not provided, error tracking disabled');
  }
};

// Sanitize sensitive data from Sentry events
const sanitizeEventData = (event) => {
  if (!event.request) return event;

  // Remove sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token'];
  if (event.request.headers) {
    sensitiveHeaders.forEach(header => {
      if (event.request.headers[header]) {
        event.request.headers[header] = '[Filtered]';
      }
    });
  }

  // Remove sensitive data from body
  if (event.request.data) {
    const sensitiveFields = ['password', 'token', 'secret', 'credit_card'];
    sensitiveFields.forEach(field => {
      if (event.request.data[field]) {
        event.request.data[field] = '[Filtered]';
      }
    });
  }

  return event;
};

// Custom analytics tracking
const analytics = {
  events: new Map(),
  users: new Map(),
  errors: new Map()
};

// Track custom event
const trackEvent = (eventName, data = {}) => {
  try {
    const timestamp = new Date();
    const event = {
      name: eventName,
      timestamp,
      data: {
        ...data,
        environment: env.NODE_ENV
      }
    };

    // Store event
    if (!analytics.events.has(eventName)) {
      analytics.events.set(eventName, []);
    }
    analytics.events.get(eventName).push(event);

    // Cleanup old events (keep last 1000)
    const events = analytics.events.get(eventName);
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }

    logger.debug(`Event tracked: ${eventName}`, data);
  } catch (error) {
    logger.error('Error tracking event:', error);
  }
};

// Track user activity
const trackUserActivity = (userId, activity) => {
  try {
    const timestamp = new Date();
    const userActivity = {
      userId,
      timestamp,
      activity,
      environment: env.NODE_ENV
    };

    // Store user activity
    if (!analytics.users.has(userId)) {
      analytics.users.set(userId, []);
    }
    analytics.users.get(userId).push(userActivity);

    // Cleanup old activities (keep last 100 per user)
    const activities = analytics.users.get(userId);
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }

    logger.debug(`User activity tracked: ${userId}`, activity);
  } catch (error) {
    logger.error('Error tracking user activity:', error);
  }
};

// Track error
const trackError = (error, context = {}) => {
  try {
    const timestamp = new Date();
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp,
      context: {
        ...context,
        environment: env.NODE_ENV
      }
    };

    // Store error
    const errorKey = `${error.name}:${error.message}`;
    if (!analytics.errors.has(errorKey)) {
      analytics.errors.set(errorKey, []);
    }
    analytics.errors.get(errorKey).push(errorData);

    // Cleanup old errors (keep last 100 per error type)
    const errors = analytics.errors.get(errorKey);
    if (errors.length > 100) {
      errors.splice(0, errors.length - 100);
    }

    // Send to Sentry if available
    if (env.SENTRY_DSN) {
      Sentry.captureException(error, {
        extra: context
      });
    }

    logger.error('Error tracked:', error, context);
  } catch (trackingError) {
    logger.error('Error tracking error:', trackingError);
  }
};

// Get analytics data
const getAnalytics = (type, filter = {}) => {
  try {
    switch (type) {
      case 'events':
        return filterAnalyticsData(analytics.events, filter);
      case 'users':
        return filterAnalyticsData(analytics.users, filter);
      case 'errors':
        return filterAnalyticsData(analytics.errors, filter);
      default:
        throw new Error(`Invalid analytics type: ${type}`);
    }
  } catch (error) {
    logger.error('Error getting analytics:', error);
    throw error;
  }
};

// Filter analytics data
const filterAnalyticsData = (data, filter) => {
  const result = {};
  
  for (const [key, values] of data.entries()) {
    const filteredValues = values.filter(value => {
      // Apply date range filter
      if (filter.startDate && new Date(value.timestamp) < new Date(filter.startDate)) {
        return false;
      }
      if (filter.endDate && new Date(value.timestamp) > new Date(filter.endDate)) {
        return false;
      }
      
      // Apply environment filter
      if (filter.environment && value.environment !== filter.environment) {
        return false;
      }
      
      return true;
    });

    if (filteredValues.length > 0) {
      result[key] = filteredValues;
    }
  }

  return result;
};

// Initialize monitoring
initializeSentry();

module.exports = {
  Sentry,
  trackEvent,
  trackUserActivity,
  trackError,
  getAnalytics
}; 