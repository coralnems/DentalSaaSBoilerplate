const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const patientController = require('../controllers/patientController');
const appointmentController = require('../controllers/appointmentController');

// Get all patients & create new patient
router
  .route('/')
  .get(protect, patientController.getAllPatients)
  .post(protect, patientController.createPatient);

// Get, update and delete patient by ID
router
  .route('/:id')
  .get(protect, patientController.getPatientById)
  .put(protect, patientController.updatePatient)
  .delete(protect, patientController.deletePatient);

// Get patient appointments
router
  .route('/:patientId/appointments')
  .get(protect, appointmentController.getPatientAppointments);

module.exports = router; 