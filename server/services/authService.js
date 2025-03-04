const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');
const { sendEmail } = require('./emailService');
const { AppError } = require('../middleware/errorHandler');

class AuthService {
  constructor() {
    this.tokenBlacklist = new Set();
  }

  // Generate access and refresh tokens
  async generateTokens(user) {
    const accessToken = jwt.sign(
      {
        _id: user._id,
        tenantId: user.tenantId,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();

    return { accessToken, refreshToken };
  }

  // Verify access token
  async verifyAccessToken(token) {
    if (this.tokenBlacklist.has(token)) {
      throw new AppError('Token has been revoked', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);

      if (!user || !user.active) {
        throw new AppError('User not found or inactive', 401);
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token has expired', 401);
      }
      throw new AppError('Invalid token', 401);
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded._id);

      if (!user || !user.active) {
        throw new AppError('User not found or inactive', 401);
      }

      // Check if refresh token exists and is valid
      const tokenDoc = user.refreshTokens.find(t => t.token === refreshToken);
      if (!tokenDoc || new Date() > tokenDoc.expiresAt) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Remove used refresh token
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      await createAuditLog({
        userId: user._id,
        action: 'TOKEN_REFRESH',
        resource: 'auth/token',
        description: 'Access token refreshed',
        tenantId: user.tenantId
      });

      return tokens;
    } catch (error) {
      throw new AppError('Error refreshing token: ' + error.message, 401);
    }
  }

  // Revoke refresh tokens for user
  async revokeRefreshTokens(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.refreshTokens = [];
    await user.save();

    await createAuditLog({
      userId: user._id,
      action: 'TOKENS_REVOKED',
      resource: 'auth/token',
      description: 'All refresh tokens revoked',
      tenantId: user.tenantId
    });
  }

  // Setup MFA for user
  async setupMFA(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const secret = speakeasy.generateSecret({
      name: `DentalApp:${user.email}`
    });

    user.mfaSecret = secret.base32;
    user.mfaEnabled = false; // Will be enabled after verification
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl
    };
  }

  // Verify MFA token
  async verifyMFAToken(userId, token) {
    const user = await User.findById(userId);
    if (!user || !user.mfaSecret) {
      throw new AppError('Invalid user or MFA not setup', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token
    });

    if (!verified) {
      throw new AppError('Invalid MFA token', 401);
    }

    if (!user.mfaEnabled) {
      user.mfaEnabled = true;
      await user.save();

      await createAuditLog({
        userId: user._id,
        action: 'MFA_ENABLED',
        resource: 'auth/mfa',
        description: 'MFA enabled for user',
        tenantId: user.tenantId
      });
    }

    return verified;
  }

  // Disable MFA for user
  async disableMFA(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    await createAuditLog({
      userId: user._id,
      action: 'MFA_DISABLED',
      resource: 'auth/mfa',
      description: 'MFA disabled for user',
      tenantId: user.tenantId
    });
  }

  // Generate password reset token
  async generatePasswordResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No user found with this email', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'passwordReset',
      data: {
        name: `${user.firstName} ${user.lastName}`,
        resetURL,
        expiryTime: '1 hour'
      }
    });

    await createAuditLog({
      userId: user._id,
      action: 'PASSWORD_RESET_REQUEST',
      resource: 'auth/password',
      description: 'Password reset requested',
      tenantId: user.tenantId
    });

    return true;
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all refresh tokens
    await this.revokeRefreshTokens(user._id);

    await createAuditLog({
      userId: user._id,
      action: 'PASSWORD_RESET_COMPLETE',
      resource: 'auth/password',
      description: 'Password reset completed',
      tenantId: user.tenantId
    });

    return true;
  }

  // Handle failed login attempts
  async handleFailedLogin(user) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 5) {
      user.lockoutUntil = new Date(Date.now() + 30 * 60000); // 30 minutes
      
      await createAuditLog({
        userId: user._id,
        action: 'ACCOUNT_LOCKED',
        resource: 'auth/login',
        description: 'Account locked due to multiple failed login attempts',
        tenantId: user.tenantId,
        severity: 'high'
      });
    }

    await user.save();
  }

  // Check if user is locked out
  async isLockedOut(user) {
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockoutUntil - new Date()) / 60000);
      throw new AppError(`Account is locked. Try again in ${remainingTime} minutes`, 403);
    }

    if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = undefined;
      await user.save();
    }

    return false;
  }
}

module.exports = new AuthService(); 