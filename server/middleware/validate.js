const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');
const { body, query } = require('express-validator');

// Middleware to validate request
const validate = validations => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    throw new AppError('Validation failed', 400);
  };
};

// Common validation schemas
const commonValidations = {
  // Patient validations
  patientId: body('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID'),

  // Appointment validations
  appointmentDate: body('date')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom(value => {
      if (new Date(value) < new Date()) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),

  // Treatment validations
  treatmentType: body('type')
    .isIn(['cleaning', 'filling', 'extraction', 'root-canal', 'crown', 'implant'])
    .withMessage('Invalid treatment type'),

  // Payment validations
  amount: body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  // Common validations
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  phone: body('phone')
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Invalid phone number format'),

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  validate,
  commonValidations
}; 