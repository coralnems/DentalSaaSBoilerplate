const express = require('express');
const { body, param, query } = require('express-validator');
const paymentController = require('../controllers/PaymentController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Validation schemas
const createPaymentSchema = [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('amount.total').isFloat({ min: 0 }).withMessage('Valid total amount is required'),
  body('amount.patient').isFloat({ min: 0 }).withMessage('Valid patient amount is required'),
  body('type').isIn(['payment', 'refund', 'adjustment']).withMessage('Invalid payment type'),
  body('method').isIn(['cash', 'credit_card', 'debit_card', 'check', 'insurance', 'bank_transfer', 'other'])
    .withMessage('Invalid payment method'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Invalid currency code')
];

const updatePaymentSchema = [
  param('id').isMongoId().withMessage('Invalid payment ID'),
  body('amount.total').optional().isFloat({ min: 0 }).withMessage('Invalid total amount'),
  body('amount.patient').optional().isFloat({ min: 0 }).withMessage('Invalid patient amount'),
  body('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
    .withMessage('Invalid status')
];

// CRUD Routes
router.post('/',
  checkPermission('create:payment'),
  createPaymentSchema,
  validateRequest,
  async (req, res, next) => {
    try {
      const payment = await paymentController.create(req);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  checkPermission('read:payment'),
  async (req, res, next) => {
    try {
      const result = await paymentController.findAll(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  checkPermission('read:payment'),
  param('id').isMongoId().withMessage('Invalid payment ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const payment = await paymentController.findOne(req);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  checkPermission('update:payment'),
  updatePaymentSchema,
  validateRequest,
  async (req, res, next) => {
    try {
      const payment = await paymentController.update(req);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  checkPermission('delete:payment'),
  param('id').isMongoId().withMessage('Invalid payment ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const payment = await paymentController.delete(req);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

// Bulk Operations Routes
router.post('/bulk',
  checkPermission('create:payment'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await paymentController.bulkCreate(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/bulk',
  checkPermission('update:payment'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await paymentController.bulkUpdate(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/bulk',
  checkPermission('delete:payment'),
  body('ids').isArray().withMessage('ids must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await paymentController.bulkDelete(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Refund Routes
router.post('/:id/refund',
  checkPermission('update:payment'),
  param('id').isMongoId().withMessage('Invalid payment ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid refund amount is required'),
  body('reason').notEmpty().withMessage('Refund reason is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const payment = await paymentController.processRefund(req);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

// Receipt Routes
router.post('/:id/send-receipt',
  checkPermission('update:payment'),
  param('id').isMongoId().withMessage('Invalid payment ID'),
  body('email').isEmail().withMessage('Valid email is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const payment = await paymentController.sendReceipt(req);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

// Patient Payments
router.get('/patient/:patientId',
  checkPermission('read:payment'),
  param('patientId').isMongoId().withMessage('Invalid patient ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const payments = await paymentController.getByPatient(req);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
);

// Appointment Payments
router.get('/appointment/:appointmentId',
  checkPermission('read:payment'),
  param('appointmentId').isMongoId().withMessage('Invalid appointment ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const payments = await paymentController.getByAppointment(req);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
);

// Date Range Payments
router.get('/date-range',
  checkPermission('read:payment'),
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  validateRequest,
  async (req, res, next) => {
    try {
      const payments = await paymentController.getByDateRange(req);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
);

// Statistics Routes
router.get('/statistics',
  checkPermission('read:payment'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validateRequest,
  async (req, res, next) => {
    try {
      const stats = await paymentController.getStatistics(req);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/insurance-statistics',
  checkPermission('read:payment'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validateRequest,
  async (req, res, next) => {
    try {
      const stats = await paymentController.getInsuranceStats(req);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Generate Receipt Number
router.get('/generate-receipt-number',
  checkPermission('create:payment'),
  async (req, res, next) => {
    try {
      const receiptNumber = await paymentController.generateReceiptNumber(req);
      res.json({ receiptNumber });
    } catch (error) {
      next(error);
    }
  }
);

// Export/Import Routes
router.get('/export',
  checkPermission('read:payment'),
  async (req, res, next) => {
    try {
      const payments = await paymentController.export(req);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/import',
  checkPermission('create:payment'),
  body().isArray().withMessage('Request body must be an array'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await paymentController.import(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 