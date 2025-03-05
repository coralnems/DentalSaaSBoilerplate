const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const AppointmentController = require('../controllers/appointment.controller');
const { asyncHandler } = require('../middleware/asyncHandler');

// Initialize controller
const appointmentController = new AppointmentController();

// Apply authentication to all routes
router.use(authenticateJWT);

// GET all appointments
router.get('/', asyncHandler(function(req, res) {
  return appointmentController.findAll(req)
    .then(function(result) {
      res.json(result);
    });
}));

// GET appointment by ID
router.get('/:id', asyncHandler(function(req, res) {
  return appointmentController.findOne(req)
    .then(function(appointment) {
      res.json(appointment);
    });
}));

// CREATE appointment
router.post('/', asyncHandler(function(req, res) {
  return appointmentController.create(req)
    .then(function(appointment) {
      res.status(201).json(appointment);
    });
}));

// UPDATE appointment
router.put('/:id', asyncHandler(function(req, res) {
  return appointmentController.update(req)
    .then(function(appointment) {
      res.json(appointment);
    });
}));

// DELETE appointment
router.delete('/:id', asyncHandler(function(req, res) {
  return appointmentController.delete(req)
    .then(function(result) {
      res.json(result);
    });
}));

// Cancel appointment
router.post('/:id/cancel', asyncHandler(function(req, res) {
  return appointmentController.cancelAppointment(req)
    .then(function(appointment) {
      res.json(appointment);
    });
}));

// GET appointments by date range
router.get('/date-range', asyncHandler(function(req, res) {
  return appointmentController.getByDateRange(req)
    .then(function(appointments) {
      res.json(appointments);
    });
}));

// GET appointments by dentist
router.get('/dentist/:dentistId', asyncHandler(function(req, res) {
  return appointmentController.getByDentist(req)
    .then(function(appointments) {
      res.json(appointments);
    });
}));

// GET appointments by patient
router.get('/patient/:patientId', asyncHandler(function(req, res) {
  return appointmentController.getByPatient(req)
    .then(function(appointments) {
      res.json(appointments);
    });
}));

module.exports = router; 