const Patient = require('../models/Patient');
const { asyncHandler } = require('../middleware/asyncHandler');
const { BadRequestError } = require('../utils/errors');

/**
 * Get all patients
 * @route GET /api/patients
 * @access Private
 */
const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find();
  
  res.status(200).json({
    success: true,
    count: patients.length,
    data: patients
  });
});

/**
 * Get patient by ID
 * @route GET /api/patients/:id
 * @access Private
 */
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    throw new BadRequestError('Patient not found');
  }
  
  res.status(200).json({
    success: true,
    data: patient
  });
});

/**
 * Create a new patient
 * @route POST /api/patients
 * @access Private
 */
const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create(req.body);
  
  res.status(201).json({
    success: true,
    data: patient
  });
});

/**
 * Update a patient
 * @route PUT /api/patients/:id
 * @access Private
 */
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!patient) {
    throw new BadRequestError('Patient not found');
  }
  
  res.status(200).json({
    success: true,
    data: patient
  });
});

/**
 * Delete a patient
 * @route DELETE /api/patients/:id
 * @access Private
 */
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    throw new BadRequestError('Patient not found');
  }
  
  await patient.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
}; 