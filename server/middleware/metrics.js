const promClient = require('prom-client');
const logger = require('../config/logger');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'tenant'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'tenant']
});

const errorTotal = new promClient.Counter({
  name: 'error_total',
  help: 'Total number of errors',
  labelNames: ['type', 'tenant']
});

const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  labelNames: ['tenant']
});

const dbOperationDuration = new promClient.Histogram({
  name: 'db_operation_duration_seconds',
  help: 'Duration of database operations in seconds',
  labelNames: ['operation', 'collection', 'tenant'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const cacheHitRatio = new promClient.Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio',
  labelNames: ['type', 'tenant']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(errorTotal);
register.registerMetric(activeUsers);
register.registerMetric(dbOperationDuration);
register.registerMetric(cacheHitRatio);

// Metrics middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const tenantId = req.tenant?._id || 'public';

  // Record request
  const route = req.route?.path || req.path;
  
  // Add response hook
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestDuration.observe(
      { method: req.method, route, status_code: statusCode, tenant: tenantId },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
      tenant: tenantId
    });

    // Record errors
    if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
      errorTotal.inc({ type: 'http', tenant: tenantId });
    }
  });

  next();
};

// Database operation tracking
const trackDbOperation = (operation, collection, tenant) => {
  const end = dbOperationDuration.startTimer();
  return {
    end: () => end({ operation, collection, tenant })
  };
};

// Cache metrics tracking
const updateCacheMetrics = (hits, total, type, tenant) => {
  const ratio = total > 0 ? hits / total : 0;
  cacheHitRatio.set({ type, tenant }, ratio);
};

// User tracking
const trackActiveUser = (tenant, increment = true) => {
  if (increment) {
    activeUsers.inc({ tenant });
  } else {
    activeUsers.dec({ tenant });
  }
};

// Metrics endpoint
const getMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).end();
  }
};

module.exports = {
  metricsMiddleware,
  trackDbOperation,
  updateCacheMetrics,
  trackActiveUser,
  getMetrics,
  register
};