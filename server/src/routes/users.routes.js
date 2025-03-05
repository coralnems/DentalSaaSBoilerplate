const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/users/profile - Get the current user's profile
router.get('/profile', async (req, res) => {
  try {
    const user = await userController.getProfile(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// PUT /api/users/profile - Update the current user's profile
router.put('/profile', async (req, res) => {
  try {
    const user = await userController.updateProfile(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// PUT /api/users/password - Update the current user's password
router.put('/password', async (req, res) => {
  try {
    const result = await userController.updatePassword(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// PUT /api/users/notifications - Update the current user's notification preferences
router.put('/notifications', async (req, res) => {
  try {
    const user = await userController.updateNotificationPreferences(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// PUT /api/users/role-settings - Update the current user's role-specific settings
router.put('/role-settings', async (req, res) => {
  try {
    const user = await userController.updateRoleSettings(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

module.exports = router; 