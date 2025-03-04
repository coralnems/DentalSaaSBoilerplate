const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, errors.array());
  }
  next();
}; 