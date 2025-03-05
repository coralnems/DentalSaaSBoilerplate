const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// Routes for /api/appointments
router
  .route('/')
  .get(protect, appointmentController.getAllAppointments)
  .post(protect, appointmentController.createAppointment);

router
  .route('/:id')
  .get(protect, appointmentController.getAppointmentById)
  .put(protect, appointmentController.updateAppointment)
  .delete(protect, appointmentController.deleteAppointment);

module.exports = router; 