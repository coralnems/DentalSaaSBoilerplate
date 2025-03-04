const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const { authenticate, verifyMFA } = require('../middleware/auth');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');
const { AppError } = require('../middleware/errorHandler');
const authController = require('../controllers/auth');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['admin', 'staff', 'dentist']).withMessage('Invalid role')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register new user
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { email, password, firstName, lastName, role, tenantId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email, tenantId });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      tenantId,
      permissions: [] // Will be set based on role in pre-save middleware
    });

    await user.save();

    // Generate tokens
    const tokens = await authService.generateTokens(user);

    await createAuditLog({
      userId: user._id,
      action: 'USER_CREATED',
      resource: 'auth/register',
      description: 'New user registered',
      tenantId: user.tenantId
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

// Traditional password-based authentication
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { email, password, tenantId } = req.body;

    // Find user
    const user = await User.findOne({ email, tenantId });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is locked out
    await authService.isLockedOut(user);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await authService.handleFailedLogin(user);
      throw new AppError('Invalid email or password', 401);
    }

    // Reset failed login attempts
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = undefined;
      await user.save();
    }

    // Generate tokens
    const tokens = await authService.generateTokens(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    await createAuditLog({
      userId: user._id,
      action: 'USER_LOGIN',
      resource: 'auth/login',
      description: 'User logged in successfully',
      tenantId: user.tenantId
    });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      ...tokens,
      mfaRequired: user.mfaEnabled
    });
  } catch (error) {
    next(error);
  }
});

// Verify MFA token
router.post('/mfa/verify', authenticate, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new AppError('MFA token is required', 400);
    }

    const verified = await authService.verifyMFAToken(req.user._id, token);
    res.json({ verified });
  } catch (error) {
    next(error);
  }
});

// Setup MFA
router.post('/mfa/setup', authenticate, async (req, res, next) => {
  try {
    const mfaDetails = await authService.setupMFA(req.user._id);
    res.json(mfaDetails);
  } catch (error) {
    next(error);
  }
});

// Disable MFA
router.post('/mfa/disable', authenticate, verifyMFA, async (req, res, next) => {
  try {
    await authService.disableMFA(req.user._id);
    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// Logout user
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // Add current token to blacklist
    authService.tokenBlacklist.add(req.token);

    // Remove refresh token
    const { refreshToken } = req.body;
    if (refreshToken) {
      req.user.refreshTokens = req.user.refreshTokens.filter(
        t => t.token !== refreshToken
      );
      await req.user.save();
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'USER_LOGOUT',
      resource: 'auth/logout',
      description: 'User logged out',
      tenantId: req.user.tenantId
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    await authService.generatePasswordResetToken(email);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    // Don't reveal if email exists
    res.json({ message: 'If an account exists, a password reset email has been sent' });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new AppError('New password is required', 400);
    }

    await authService.resetPassword(token, password);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// WebAuthn routes
router.post('/webauthn/register/start', authenticate, authController.webAuthnRegisterStart);
router.post('/webauthn/register/complete', authenticate, authController.webAuthnRegisterComplete);
router.post('/webauthn/login/start', authController.webAuthnLoginStart);
router.post('/webauthn/login/complete', authController.webAuthnLoginComplete);

// QR Code authentication routes
router.post('/qr/start', authController.qrLoginStart);
router.get('/qr/status/:sessionId', authController.qrLoginStatus);

module.exports = router;
