const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth/authRoutes');
const redisRoutes = require('./redis.routes');
const appointmentRoutes = require('./appointmentRoutes');
const patientRoutes = require('./patientRoutes');
const treatmentRoutes = require('./treatments.routes');
const paymentRoutes = require('./payments.routes');
const userRoutes = require('./users.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/redis', redisRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/patients', patientRoutes);
router.use('/treatments', treatmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

module.exports = router; 