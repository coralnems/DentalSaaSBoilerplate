const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const User = require('../models/User');
const webAuthnService = require('../services/webauthn');
const qrAuthService = require('../services/qrauth');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Traditional password-based authentication
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// WebAuthn registration
exports.webAuthnRegisterStart = async (req, res) => {
  try {
    const { user } = req;
    const options = await webAuthnService.generateRegistrationOptions(user);
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: 'Failed to start registration', error: error.message });
  }
};

exports.webAuthnRegisterComplete = async (req, res) => {
  try {
    const { user } = req;
    const verification = await webAuthnService.verifyRegistration(user, req.body);
    
    if (verification.verified) {
      res.json({ message: 'Registration successful' });
    } else {
      res.status(400).json({ message: 'Registration failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete registration', error: error.message });
  }
};

// WebAuthn authentication
exports.webAuthnLoginStart = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const options = await webAuthnService.generateAuthenticationOptions(user);
    res.json({ options, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start authentication', error: error.message });
  }
};

exports.webAuthnLoginComplete = async (req, res) => {
  try {
    const { userId, credential } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const verification = await webAuthnService.verifyAuthentication(user, credential);
    
    if (verification.verified) {
      const token = generateToken(user);
      res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete authentication', error: error.message });
  }
};

// QR Code authentication
exports.qrLoginStart = async (req, res) => {
  try {
    const session = await qrAuthService.createAuthSession();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to start QR authentication', error: error.message });
  }
};

exports.qrLoginStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = await qrAuthService.checkAuthStatus(sessionId);

    if (status.status === 'completed') {
      const { userId, email } = await qrAuthService.verifyToken(status.token);
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user if they don't exist (first-time Authentik login)
        user = await User.create({
          email,
          authentikId: userId,
          role: 'user'
        });
      }

      const token = generateToken(user);
      res.json({ 
        status: 'completed',
        token,
        user: { id: user._id, email: user.email, role: user.role }
      });
    } else {
      res.json({ status: status.status });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to check authentication status', error: error.message });
  }
}; 