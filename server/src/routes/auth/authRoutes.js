const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getCurrentUser, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  refreshToken, 
  logout 
} = require('../../controllers/auth/authController');
const { authenticateJWT } = require('../../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateJWT, getCurrentUser);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post('/verify-email', verifyEmail);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', logout);

module.exports = router; 