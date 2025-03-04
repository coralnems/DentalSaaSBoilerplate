const { validationResult, body, query, param } = require('express-validator');
const mongoose = require('mongoose');
const AppError = require('./errorHandler').AppError;

// Custom validators
const isMongoId = (value) => mongoose.Types.ObjectId.isValid(value);
const isValidDate = (value) => !isNaN(Date.parse(value));
const isValidPhone = (value) => /^\+?[\d\s-()]{8,}$/.test(value);
const isValidPassword = (value) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(value);
};

// Common validation rules
const commonRules = {
  id: param('id')
    .exists().withMessage('ID is required')
    .custom(isMongoId).withMessage('Invalid ID format'),

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  sorting: query('sort')
    .optional()
    .isString().withMessage('Sort must be a string')
    .matches(/^[-+]?[a-zA-Z]+$/).withMessage('Invalid sort format'),

  dateRange: [
    query('startDate')
      .optional()
      .custom(isValidDate).withMessage('Invalid start date'),
    query('endDate')
      .optional()
      .custom(isValidDate).withMessage('Invalid end date')
      .custom((endDate, { req }) => {
        if (req.query.startDate && new Date(endDate) < new Date(req.query.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ]
};

// Validation rules for different entities
const validationRules = {
  user: {
    create: [
      body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
      body('password')
        .custom(isValidPassword)
        .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'),
      body('firstName')
        .trim()
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
      body('lastName')
        .trim()
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
      body('phone')
        .optional()
        .custom(isValidPhone).withMessage('Invalid phone number format'),
      body('role')
        .isIn(['user', 'admin', 'superadmin']).withMessage('Invalid role')
    ],
    update: [
      body('email')
        .optional()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
      body('password')
        .optional()
        .custom(isValidPassword)
        .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'),
      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
      body('phone')
        .optional()
        .custom(isValidPhone).withMessage('Invalid phone number format')
    ]
  },

  tenant: {
    create: [
      body('name')
        .trim()
        .isLength({ min: 2 }).withMessage('Tenant name must be at least 2 characters long'),
      body('subdomain')
        .trim()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Invalid subdomain format'),
      body('plan')
        .isIn(['free', 'basic', 'premium']).withMessage('Invalid plan'),
      body('settings')
        .optional()
        .isObject().withMessage('Settings must be an object')
    ],
    update: [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Tenant name must be at least 2 characters long'),
      body('plan')
        .optional()
        .isIn(['free', 'basic', 'premium']).withMessage('Invalid plan'),
      body('settings')
        .optional()
        .isObject().withMessage('Settings must be an object')
    ]
  }
};

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }));
      return next(new AppError('Validation failed', 400, formattedErrors));
    }

    next();
  };
};

// Sanitization middleware
const sanitize = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

module.exports = {
  validate,
  sanitize,
  commonRules,
  validationRules
}; 