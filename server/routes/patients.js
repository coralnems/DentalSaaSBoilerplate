const express = require('express');
const { body, param, query } = require('express-validator');
const patientController = require('../controllers/PatientController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Validation schemas
const createPatientSchema = [
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('contact.email').isEmail().withMessage('Valid email is required'),
  body('contact.phone').notEmpty().withMessage('Phone number is required')
];

const updatePatientSchema = [
  param('id').isMongoId().withMessage('Invalid patient ID'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender')
];

// CRUD Routes
router.post('/',
  checkPermission('create:patient'),
  createPatientSchema,
  validateRequest,
  async (req, res, next) => {
    try {
      const patient = await patientController.create(req);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  checkPermission('read:patient'),
  async (req, res, next) => {
    try {
      const result = await patientController.findAll(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  checkPermission('read:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const patient = await patientController.findOne(req);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  checkPermission('update:patient'),
  updatePatientSchema,
  validateRequest,
  async (req, res, next) => {
    try {
      const patient = await patientController.update(req);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  checkPermission('delete:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const patient = await patientController.delete(req);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// Bulk Operations Routes
router.post('/bulk',
  checkPermission('create:patient'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await patientController.bulkCreate(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/bulk',
  checkPermission('update:patient'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await patientController.bulkUpdate(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/bulk',
  checkPermission('delete:patient'),
  body('ids').isArray().withMessage('ids must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await patientController.bulkDelete(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Medical History Routes
router.get('/:id/medical-history',
  checkPermission('read:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const history = await patientController.getMedicalHistory(req);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id/medical-history',
  checkPermission('update:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const patient = await patientController.updateMedicalHistory(req);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// Dental History Routes
router.get('/:id/dental-history',
  checkPermission('read:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const history = await patientController.getDentalHistory(req);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id/dental-history',
  checkPermission('update:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const patient = await patientController.updateDentalHistory(req);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// Document Routes
router.post('/:id/documents',
  checkPermission('update:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const document = await patientController.addDocument(req);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id/documents/:documentId',
  checkPermission('update:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  param('documentId').isMongoId().withMessage('Invalid document ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await patientController.removeDocument(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Insurance Routes
router.get('/insurance/:provider',
  checkPermission('read:patient'),
  async (req, res, next) => {
    try {
      const patients = await patientController.getByInsuranceProvider(req);
      res.json(patients);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id/insurance',
  checkPermission('update:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const patient = await patientController.updateInsurance(req);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// Notes Routes
router.post('/:id/notes',
  checkPermission('update:patient'),
  param('id').isMongoId().withMessage('Invalid patient ID'),
  body('content').notEmpty().withMessage('Note content is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const note = await patientController.addNote(req);
      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  }
);

// Export/Import Routes
router.get('/export',
  checkPermission('read:patient'),
  async (req, res, next) => {
    try {
      const patients = await patientController.export(req);
      res.json(patients);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/import',
  checkPermission('create:patient'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await patientController.import(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Statistics Route
router.get('/statistics',
  checkPermission('read:patient'),
  async (req, res, next) => {
    try {
      const stats = await patientController.getStatistics(req);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 