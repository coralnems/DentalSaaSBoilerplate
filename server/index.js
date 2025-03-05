// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Create Express app
const app = express();

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173'];

// Security middleware
app.use(helmet());

// Secure HTTP headers with environment-specific CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'", 
        ...(isProduction ? [] : ['ws://localhost:*']), // Allow WebSocket in development
        process.env.API_URL || 'https://api.example.com'
      ],
      frameSrc: ["'self'"],
      childSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        ...(isProduction ? [] : ["'unsafe-eval'"]), // Only allow unsafe-eval in development
        // Hash for inline scripts if needed
        process.env.CSP_SCRIPT_HASH || ''
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://example.com'],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  })
);

// CORS with environment-specific configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Cookie parser for HTTP-only cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'dental-clinic-secret'));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression
app.use(compression());

// Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', require('./src/routes'));

// Serve React app in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

// Handle 404s
app.use(notFound);

// Error handling
app.use(errorHandler);

// Connect to MongoDB and start server
function startServer() {
  try {
    connectDB().then(() => {
      // Start server
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, function() {
        console.log(`[INFO] Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`[INFO] API available at http://localhost:${PORT}/api`);
        console.log(`[INFO] Health check at http://localhost:${PORT}/health`);
      });
    });
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
