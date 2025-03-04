const express = require('express');
const { body } = require('express-validator');
const appointmentController = require('../controllers/appointment');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

// Validation middleware
const validateAppointment = [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('dentist').isMongoId().withMessage('Valid dentist ID is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('type')
    .isIn(['checkup', 'cleaning', 'filling', 'extraction', 'root-canal', 'other'])
    .withMessage('Valid appointment type is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'emergency'])
    .withMessage('Valid urgency level is required'),
  body('notes').optional().trim(),
  body('reminders')
    .optional()
    .isArray()
    .withMessage('Reminders must be an array')
    .custom(reminders => {
      const validTypes = ['email', 'sms', 'phone'];
      return reminders.every(type => validTypes.includes(type));
    })
    .withMessage('Invalid reminder type')
];

const validateStatus = [
  body('status')
    .isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Valid status is required')
];

const validateCancellation = [
  body('reason').trim().notEmpty().withMessage('Cancellation reason is required')
];

// Apply authentication to all routes
router.use(authenticate);

// Get all appointments (staff and admin only)
router.get(
  '/',
  authorize(['admin', 'staff', 'dentist']),
  appointmentController.getAppointments
);

// Get available slots
router.get(
  '/available-slots',
  authorize(['admin', 'staff', 'dentist']),
  appointmentController.getAvailableSlots
);

// Get single appointment
router.get(
  '/:id',
  authorize(['admin', 'staff', 'dentist']),
  appointmentController.getAppointment
);

// Create new appointment
router.post(
  '/',
  authorize(['admin', 'staff']),
  validateAppointment,
  validateRequest,
  appointmentController.createAppointment
);

// Update appointment
router.put(
  '/:id',
  authorize(['admin', 'staff']),
  validateAppointment,
  validateRequest,
  appointmentController.updateAppointment
);

// Update appointment status
router.patch(
  '/:id/status',
  authorize(['admin', 'staff', 'dentist']),
  validateStatus,
  validateRequest,
  appointmentController.updateAppointment
);

// Cancel appointment
router.post(
  '/:id/cancel',
  authorize(['admin', 'staff']),
  validateCancellation,
  validateRequest,
  appointmentController.cancelAppointment
);

module.exports = router; 