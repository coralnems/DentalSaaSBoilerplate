const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const path = require('path');
const cors = require('cors');
const { resolveTenant } = require('./middleware/tenantMiddleware');
const tenantRoutes = require('./routes/tenants');
const initializeSecrets = require('./scripts/initSecrets');

const { errorHandler, logger: errorLogger, AppError } = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');
const requestLogger = require('./middleware/logger');
const swagger = require('./config/swagger');
const routes = require('./routes');

// Initialize secrets before starting the server
initializeSecrets();

// Create Express app
const app = express();

// Request logging
app.use(requestLogger);

// Apply security middleware
app.use(securityMiddleware.helmet);
app.use(securityMiddleware.cors);
app.use(securityMiddleware.mongoSanitize);
app.use(securityMiddleware.xss);
app.use(securityMiddleware.hpp);
app.use('/api', securityMiddleware.limiter);
app.use('/api', securityMiddleware.speedLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression
app.use(compression());

// API Documentation
app.use('/api-docs', swagger.serve, swagger.setup);

// Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// Apply tenant middleware to all routes except tenant management
app.use('/api/tenants', tenantRoutes);
app.use('/api/*', resolveTenant);

// Import and use other routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const appointmentRoutes = require('./routes/appointments');
const patientRoutes = require('./routes/patients');
const insuranceRoutes = require('./routes/insurance');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payments');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(errorHandler);

// Unhandled route handler
app.all('*', (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Unhandled rejection handler
process.on('unhandledRejection', (err) => {
  errorLogger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  errorLogger.error(err.name, err.message);
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  errorLogger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  errorLogger.error(err.name, err.message);
  process.exit(1);
});

// SIGTERM handler
process.on('SIGTERM', () => {
  errorLogger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    errorLogger.info('Connected to MongoDB');
    // Ping the database to verify connection
    return mongoose.connection.db.admin().command({ ping: 1 });
  })
  .then(() => {
    errorLogger.info('MongoDB connection verified - Database responded to ping');
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      errorLogger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    errorLogger.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
