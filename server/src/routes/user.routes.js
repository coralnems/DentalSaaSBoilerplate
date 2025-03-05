const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

// All routes require authentication
router.use(authenticateJWT);

// Get user profile
router.get('/profile', asyncHandler(function(req, res) {
  return userController.getProfile(req)
    .then(function(result) {
      res.status(result.statusCode).json(result);
    });
}));

// Update user profile
router.put('/profile', asyncHandler(function(req, res) {
  return userController.updateProfile(req)
    .then(function(result) {
      res.status(result.statusCode).json(result);
    });
}));

// Update user password
router.put('/password', asyncHandler(function(req, res) {
  return userController.updatePassword(req)
    .then(function(result) {
      res.status(result.statusCode).json(result);
    });
}));

// Get user preferences
router.get('/preferences', asyncHandler(function(req, res) {
  return userController.getPreferences(req)
    .then(function(result) {
      res.status(result.statusCode).json(result);
    });
}));

// Update user preferences
router.put('/preferences', asyncHandler(function(req, res) {
  return userController.updatePreferences(req)
    .then(function(result) {
      res.status(result.statusCode).json(result);
    });
}));

// Get all users (admin only)
router.get('/', asyncHandler(function(req, res) {
  return userController.getAllUsers(req)
    .then(function(result) {
      res.status(result.statusCode).json(result);
    });
}));

module.exports = router; 