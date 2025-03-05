const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/users/profile - Get the current user's profile
router.get('/profile', asyncHandler(function(req, res) {
  return userController.getProfile(req)
    .then(function(result) {
      res.status(result.statusCode || 200).json(result);
    });
}));

// PUT /api/users/profile - Update the current user's profile
router.put('/profile', asyncHandler(function(req, res) {
  return userController.updateProfile(req)
    .then(function(result) {
      res.status(result.statusCode || 200).json(result);
    });
}));

// PUT /api/users/password - Update the current user's password
router.put('/password', asyncHandler(function(req, res) {
  return userController.updatePassword(req)
    .then(function(result) {
      res.status(result.statusCode || 200).json(result);
    });
}));

// GET /api/users/preferences - Get user preferences
router.get('/preferences', asyncHandler(function(req, res) {
  return userController.getPreferences(req)
    .then(function(result) {
      res.status(result.statusCode || 200).json(result);
    });
}));

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', asyncHandler(function(req, res) {
  return userController.updatePreferences(req)
    .then(function(result) {
      res.status(result.statusCode || 200).json(result);
    });
}));

// PUT /api/users/notifications - Update the current user's notification preferences
router.put('/notifications', asyncHandler(function(req, res) {
  return userController.updateNotificationPreferences(req)
    .then(function(result) {
      res.status(result.statusCode || 200).json(result);
    });
}));

// PUT /api/users/role-settings - Update the current user's role-specific settings
router.put('/role-settings', asyncHandler(function(req, res) {
  return userController.updateRoleSettings(req)
    .then(function(result) {
      res.status(result.statusCode || 200).json(result);
    });
}));

// GET /api/users - Get all users (admin only)
router.get('/', authorizeRoles(['admin']), asyncHandler(function(req, res) {
  return userController.getAllUsers(req)
    .then(function(result) {
      res.status(result.statusCode || 200).json(result);
    });
}));

module.exports = router; 