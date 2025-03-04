const express = require('express');
const { body } = require('express-validator');
const patientController = require('../controllers/patient');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

// Validation middleware
const validatePatient = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
  body('address.country').trim().notEmpty().withMessage('Country is required'),
  body('emergencyContact.name').trim().notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContact.relationship').trim().notEmpty().withMessage('Emergency contact relationship is required'),
  body('emergencyContact.phone').trim().notEmpty().withMessage('Emergency contact phone is required')
];

const validateMedicalHistory = [
  body('condition').optional().isString(),
  body('medication').optional().isObject().custom(med => {
    if (med && (!med.name || !med.dosage || !med.frequency)) {
      throw new Error('Medication must include name, dosage, and frequency');
    }
    return true;
  }),
  body('surgery').optional().isObject().custom(surgery => {
    if (surgery && (!surgery.procedure || !surgery.date)) {
      throw new Error('Surgery must include procedure and date');
    }
    return true;
  }),
  body('allergy').optional().isString()
];

const validateNote = [
  body('content').trim().notEmpty().withMessage('Note content is required')
];

const validateInsurance = [
  body('provider').trim().notEmpty().withMessage('Insurance provider is required'),
  body('policyNumber').trim().notEmpty().withMessage('Policy number is required'),
  body('groupNumber').optional().trim(),
  body('primaryInsured').optional().isObject().custom(insured => {
    if (insured && (!insured.name || !insured.relationship)) {
      throw new Error('Primary insured must include name and relationship');
    }
    return true;
  })
];

// Apply authentication to all routes
router.use(authenticate);

// Get all patients (staff and admin only)
router.get(
  '/',
  authorize(['admin', 'staff', 'dentist']),
  patientController.getPatients
);

// Get single patient
router.get(
  '/:id',
  authorize(['admin', 'staff', 'dentist']),
  patientController.getPatient
);

// Create new patient
router.post(
  '/',
  authorize(['admin', 'staff']),
  validatePatient,
  validateRequest,
  patientController.createPatient
);

// Update patient
router.put(
  '/:id',
  authorize(['admin', 'staff']),
  validatePatient,
  validateRequest,
  patientController.updatePatient
);

// Delete (archive) patient
router.delete(
  '/:id',
  authorize(['admin']),
  patientController.deletePatient
);

// Add medical history
router.post(
  '/:id/medical-history',
  authorize(['admin', 'staff', 'dentist']),
  validateMedicalHistory,
  validateRequest,
  patientController.addMedicalHistory
);

// Add note
router.post(
  '/:id/notes',
  authorize(['admin', 'staff', 'dentist']),
  validateNote,
  validateRequest,
  patientController.addNote
);

// Update insurance
router.put(
  '/:id/insurance',
  authorize(['admin', 'staff']),
  validateInsurance,
  validateRequest,
  patientController.updateInsurance
);

module.exports = router; 