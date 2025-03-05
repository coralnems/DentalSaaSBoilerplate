const Payment = require('../models/Payment');
const { asyncHandler } = require('../middleware/asyncHandler');
const { BadRequestError } = require('../utils/errors');

/**
 * Get all payments
 * @route GET /api/payments
 * @access Private
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('patient', 'firstName lastName')
    .populate('appointment', 'startTime endTime');
  
  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

/**
 * Get payment by ID
 * @route GET /api/payments/:id
 * @access Private
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone')
    .populate('appointment', 'startTime endTime type');
  
  if (!payment) {
    throw new BadRequestError('Payment not found');
  }
  
  res.status(200).json({
    success: true,
    data: payment
  });
});

/**
 * Create a new payment
 * @route POST /api/payments
 * @access Private
 */
const createPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.create(req.body);
  
  res.status(201).json({
    success: true,
    data: payment
  });
});

/**
 * Update a payment
 * @route PUT /api/payments/:id
 * @access Private
 */
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!payment) {
    throw new BadRequestError('Payment not found');
  }
  
  res.status(200).json({
    success: true,
    data: payment
  });
});

/**
 * Delete a payment
 * @route DELETE /api/payments/:id
 * @access Private
 */
const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  
  if (!payment) {
    throw new BadRequestError('Payment not found');
  }
  
  await payment.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * Get payments by patient
 * @route GET /api/patients/:patientId/payments
 * @access Private
 */
const getPatientPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ patient: req.params.patientId })
    .populate('appointment', 'startTime endTime type');
  
  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPatientPayments
}; 