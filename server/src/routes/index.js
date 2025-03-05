const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth/authRoutes');
const redisRoutes = require('./redis.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/redis', redisRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

module.exports = router; 