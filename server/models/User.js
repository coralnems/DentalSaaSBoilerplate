const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'dentist', 'patient'],
    default: 'staff'
  },
  permissions: [{
    type: String,
    enum: [
      'create:patient',
      'read:patient',
      'update:patient',
      'delete:patient',
      'create:appointment',
      'read:appointment',
      'update:appointment',
      'delete:appointment',
      'create:payment',
      'read:payment',
      'update:payment',
      'delete:payment',
      'access:reports',
      'manage:users',
      'manage:settings'
    ]
  }],
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockoutUntil: Date,
  avatar: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { 
      _id: this._id,
      tenantId: this.tenantId,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
  );
  return token;
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const token = jwt.sign(
    { _id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  
  this.refreshTokens.push({ token, expiresAt });
  return token;
};

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.role === 'admin' || this.permissions.includes(permission);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.mfaSecret;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 