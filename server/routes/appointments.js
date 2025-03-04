const express = require('express');
const { body, param, query } = require('express-validator');
const appointmentController = require('../controllers/AppointmentController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Validation schemas
const createAppointmentSchema = [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('dentistId').isMongoId().withMessage('Valid dentist ID is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('type').isIn([
    'checkup',
    'cleaning',
    'filling',
    'extraction',
    'root-canal',
    'crown',
    'bridge',
    'implant',
    'orthodontic',
    'emergency',
    'consultation',
    'other'
  ]).withMessage('Invalid appointment type'),
  body('room').notEmpty().withMessage('Room is required')
];

const updateAppointmentSchema = [
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('startTime').optional().isISO8601().withMessage('Invalid start time'),
  body('endTime').optional().isISO8601().withMessage('Invalid end time'),
  body('type').optional().isIn([
    'checkup',
    'cleaning',
    'filling',
    'extraction',
    'root-canal',
    'crown',
    'bridge',
    'implant',
    'orthodontic',
    'emergency',
    'consultation',
    'other'
  ]).withMessage('Invalid appointment type')
];

// CRUD Routes
router.post('/',
  checkPermission('create:appointment'),
  createAppointmentSchema,
  validateRequest,
  async (req, res, next) => {
    try {
      const appointment = await appointmentController.create(req);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  checkPermission('read:appointment'),
  async (req, res, next) => {
    try {
      const result = await appointmentController.findAll(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  checkPermission('read:appointment'),
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const appointment = await appointmentController.findOne(req);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  checkPermission('update:appointment'),
  updateAppointmentSchema,
  validateRequest,
  async (req, res, next) => {
    try {
      const appointment = await appointmentController.update(req);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  checkPermission('delete:appointment'),
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const appointment = await appointmentController.delete(req);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

// Bulk Operations Routes
router.post('/bulk',
  checkPermission('create:appointment'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await appointmentController.bulkCreate(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/bulk',
  checkPermission('update:appointment'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await appointmentController.bulkUpdate(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/bulk',
  checkPermission('delete:appointment'),
  body('ids').isArray().withMessage('ids must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await appointmentController.bulkDelete(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Date Range Routes
router.get('/date-range',
  checkPermission('read:appointment'),
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const appointments = await appointmentController.getByDateRange(req);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }
);

// Dentist Appointments
router.get('/dentist/:dentistId',
  checkPermission('read:appointment'),
  param('dentistId').isMongoId().withMessage('Invalid dentist ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const appointments = await appointmentController.getByDentist(req);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }
);

// Patient Appointments
router.get('/patient/:patientId',
  checkPermission('read:appointment'),
  param('patientId').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const appointments = await appointmentController.getByPatient(req);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }
);

// Check Conflicts
router.post('/check-conflicts',
  checkPermission('read:appointment'),
  body('dentistId').isMongoId().withMessage('Valid dentist ID is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await appointmentController.checkConflicts(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Cancel Appointment
router.post('/:id/cancel',
  checkPermission('update:appointment'),
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const appointment = await appointmentController.cancelAppointment(req);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

// Reschedule Appointment
router.post('/:id/reschedule',
  checkPermission('update:appointment'),
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('newDate').isISO8601().withMessage('Valid new date is required'),
  body('reason').notEmpty().withMessage('Rescheduling reason is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const appointment = await appointmentController.rescheduleAppointment(req);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

// Complete Appointment
router.post('/:id/complete',
  checkPermission('update:appointment'),
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const appointment = await appointmentController.completeAppointment(req);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

// Get Statistics
router.get('/statistics',
  checkPermission('read:appointment'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validateRequest,
  async (req, res, next) => {
    try {
      const stats = await appointmentController.getStatistics(req);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Get Available Slots
router.get('/available-slots',
  checkPermission('read:appointment'),
  query('date').isISO8601().withMessage('Valid date is required'),
  query('dentistId').isMongoId().withMessage('Valid dentist ID is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const slots = await appointmentController.getAvailableSlots(req);
      res.json(slots);
    } catch (error) {
      next(error);
    }
  }
);

// Export/Import Routes
router.get('/export',
  checkPermission('read:appointment'),
  async (req, res, next) => {
    try {
      const appointments = await appointmentController.export(req);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/import',
  checkPermission('create:appointment'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await appointmentController.import(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 