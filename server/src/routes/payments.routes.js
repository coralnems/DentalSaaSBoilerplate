const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/payments - Get all payments (admin, receptionist)
router.get('/', authorizeRoles(['admin', 'receptionist']), async (req, res) => {
  try {
    const result = await paymentController.findAll(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// GET /api/payments/date-range - Get payments by date range (admin, receptionist)
router.get('/date-range', authorizeRoles(['admin', 'receptionist']), async (req, res) => {
  try {
    const result = await paymentController.findByDateRange(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// GET /api/payments/patient/:patientId - Get payments by patient (admin, receptionist, patient)
router.get('/patient/:patientId', async (req, res) => {
  try {
    // If user is a patient, they can only access their own payments
    if (req.user.role === 'patient' && req.params.patientId !== req.user.patientId) {
      return res.status(403).json({
        message: 'Access denied. Patients can only view their own payments.',
      });
    }
    
    const result = await paymentController.findByPatient(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// GET /api/payments/appointment/:appointmentId - Get payments by appointment
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    // If user is a patient, check if the appointment belongs to them
    if (req.user.role === 'patient') {
      // This would require an additional check in a real app
      // to verify the appointment belongs to the patient
    }
    
    const result = await paymentController.findByAppointment(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// GET /api/payments/:id - Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await paymentController.findOne(req);
    
    // If user is a patient, check if the payment belongs to them
    if (req.user.role === 'patient' && result.patientId.toString() !== req.user.patientId) {
      return res.status(403).json({
        message: 'Access denied. Patients can only view their own payments.',
      });
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// POST /api/payments - Create a new payment (admin, receptionist)
router.post('/', authorizeRoles(['admin', 'receptionist']), async (req, res) => {
  try {
    const result = await paymentController.create(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// PUT /api/payments/:id - Update a payment (admin, receptionist)
router.put('/:id', authorizeRoles(['admin', 'receptionist']), async (req, res) => {
  try {
    const result = await paymentController.update(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// DELETE /api/payments/:id - Delete a payment (admin only)
router.delete('/:id', authorizeRoles(['admin']), async (req, res) => {
  try {
    const result = await paymentController.delete(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

module.exports = router; 