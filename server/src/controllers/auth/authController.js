const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const { logger } = require('../../middleware/errorHandler');

/**
 * Generate JWT token
 */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || '7d'
  });
}

/**
 * Generate refresh token
 */
function generateRefreshToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
function register(req, res) {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    User.findOne({ email })
      .then(userExists => {
        if (userExists) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(password, salt))
          .then(hashedPassword => {
            // Create user
            return User.create({
              firstName,
              lastName,
              email,
              password: hashedPassword,
              role: role || 'patient'
            });
          })
          .then(user => {
            if (user) {
              // Generate tokens
              const token = generateToken(user._id);
              const refreshToken = generateRefreshToken(user._id);
              
              res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token,
                refreshToken
              });
            } else {
              res.status(400).json({ message: 'Invalid user data' });
            }
          })
          .catch(error => {
            logger.error('Register error:', error.message);
            res.status(500).json({ message: 'Server error' });
          });
      })
      .catch(error => {
        logger.error('Register error:', error.message);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    logger.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    User.findOne({ email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password matches using the model's method
        user.comparePassword(password)
          .then(isMatch => {
            if (!isMatch) {
              return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate tokens
            const token = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            
            res.json({
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              token,
              refreshToken
            });
          })
          .catch(error => {
            logger.error('Login error:', error.message);
            res.status(500).json({ message: 'Server error', error: error.message });
          });
      })
      .catch(error => {
        logger.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
      });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
function getCurrentUser(req, res) {
  try {
    User.findById(req.user._id).select('-password')
      .then(user => {
        res.json(user);
      })
      .catch(error => {
        logger.error('Get current user error:', error.message);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    logger.error('Get current user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }
    
    User.findOne({ email })
      .then(user => {
        if (!user) {
          // Don't reveal that the user doesn't exist for security reasons
          return res.status(200).json({ 
            message: 'If a user with that email exists, a password reset link has been sent' 
          });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash token and save to user
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
        user.save()
          .then(() => {
            // In a real application, send an email with the reset token
            // For now, just return success
            let response = { 
              message: 'If a user with that email exists, a password reset link has been sent'
            };
            
            // Only include token in development for testing
            if (process.env.NODE_ENV === 'development') {
              response.resetToken = resetToken;
            }
            
            res.status(200).json(response);
          })
          .catch(error => {
            logger.error('Forgot password error:', error.message);
            res.status(500).json({ message: 'Server error' });
          });
      })
      .catch(error => {
        logger.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    logger.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Please provide token and new password' });
    }
    
    // Hash the token to compare with the stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with the token and check if token is still valid
    User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })
      .then(user => {
        if (!user) {
          return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        // Hash the new password
        bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(password, salt))
          .then(hashedPassword => {
            // Update user
            user.password = hashedPassword;
            
            // Clear reset token fields
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            
            return user.save();
          })
          .then(() => {
            res.status(200).json({ message: 'Password reset successful' });
          })
          .catch(error => {
            logger.error('Reset password error:', error.message);
            res.status(500).json({ message: 'Server error' });
          });
      })
      .catch(error => {
        logger.error('Reset password error:', error.message);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    logger.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * @desc    Verify email
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Please provide a verification token' });
    }
    
    // Hash the token to compare with the stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with the token
    User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    })
      .then(user => {
        if (!user) {
          return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        // Update user
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        
        user.save()
          .then(() => {
            res.status(200).json({ message: 'Email verified successfully' });
          })
          .catch(error => {
            logger.error('Verify email error:', error.message);
            res.status(500).json({ message: 'Server error' });
          });
      })
      .catch(error => {
        logger.error('Verify email error:', error.message);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    logger.error('Verify email error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Please provide a refresh token' });
    }
    
    // Verify refresh token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.error('Refresh token error:', err.message);
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
      
      // Generate new access token
      const accessToken = generateToken(decoded.id);
      
      res.status(200).json({ accessToken });
    });
  } catch (error) {
    logger.error('Refresh token error:', error.message);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
function logout(req, res) {
  // In a stateless JWT authentication system, the client is responsible for removing the token
  // The server doesn't need to do anything special for logout
  res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  logout
}; 