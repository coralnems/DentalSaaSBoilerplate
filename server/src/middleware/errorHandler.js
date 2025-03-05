/**
 * Error handling middleware
 */

const { ApiError } = require('../utils/errors');

// Simple logger for development
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args)
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Check if the error is an instance of our ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = {};
    
    // Extract validation errors
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // Handle Mongoose CastError (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // Default to 500 server error
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound, logger }; 