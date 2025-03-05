const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');
const { asyncHandler } = require('../middleware/asyncHandler');

// Routes for /api/appointments
router
  .route('/')
  .get(authenticateJWT, asyncHandler(appointmentController.getAllAppointments))
  .post(authenticateJWT, asyncHandler(appointmentController.createAppointment));

router
  .route('/:id')
  .get(authenticateJWT, asyncHandler(appointmentController.getAppointmentById))
  .put(authenticateJWT, asyncHandler(appointmentController.updateAppointment))
  .delete(authenticateJWT, asyncHandler(appointmentController.deleteAppointment));

// Cancel appointment
router.post('/:id/cancel', authenticateJWT, asyncHandler(appointmentController.cancelAppointment));

// GET appointments by date range
router.get('/date-range', authenticateJWT, asyncHandler(appointmentController.getByDateRange));

// GET appointments by dentist
router.get('/dentist/:dentistId', authenticateJWT, asyncHandler(appointmentController.getByDentist));

// GET appointments by patient
router.get('/patient/:patientId', authenticateJWT, asyncHandler(appointmentController.getByPatient));

module.exports = router; 