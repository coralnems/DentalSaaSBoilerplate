const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');
const { asyncHandler } = require('../middleware/asyncHandler');

// Routes for /api/appointments
router
  .route('/')
  .get(protect, asyncHandler(appointmentController.getAllAppointments))
  .post(protect, asyncHandler(appointmentController.createAppointment));

router
  .route('/:id')
  .get(protect, asyncHandler(appointmentController.getAppointmentById))
  .put(protect, asyncHandler(appointmentController.updateAppointment))
  .delete(protect, asyncHandler(appointmentController.deleteAppointment));

// Cancel appointment
router.post('/:id/cancel', protect, asyncHandler(appointmentController.cancelAppointment));

// GET appointments by date range
router.get('/date-range', protect, asyncHandler(appointmentController.getByDateRange));

// GET appointments by dentist
router.get('/dentist/:dentistId', protect, asyncHandler(appointmentController.getByDentist));

// GET appointments by patient
router.get('/patient/:patientId', protect, asyncHandler(appointmentController.getByPatient));

module.exports = router; 