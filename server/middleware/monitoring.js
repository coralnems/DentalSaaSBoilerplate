const promClient = require('prom-client');
const { logger } = require('./errorHandler');

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);

// Monitoring middleware
const monitoringMiddleware = (req, res, next) => {
  // Skip monitoring endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();
  
  // Increment active connections
  activeConnections.inc();

  // Record response metrics
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;

    // Record metrics
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(durationInSeconds);

    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();

    // Decrement active connections
    activeConnections.dec();
  });

  next();
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    logger.error('Error generating metrics:', err);
    res.status(500).end();
  }
};

module.exports = {
  monitoringMiddleware,
  metricsEndpoint,
  register
}; 