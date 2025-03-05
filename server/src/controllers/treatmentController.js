const Treatment = require('../models/Treatment');
const { asyncHandler } = require('../middleware/asyncHandler');
const { BadRequestError } = require('../utils/errors');

/**
 * Get all treatments
 * @route GET /api/treatments
 * @access Private
 */
const getAllTreatments = asyncHandler(async (req, res) => {
  const treatments = await Treatment.find();
  
  res.status(200).json({
    success: true,
    count: treatments.length,
    data: treatments
  });
});

/**
 * Get treatment by ID
 * @route GET /api/treatments/:id
 * @access Private
 */
const getTreatmentById = asyncHandler(async (req, res) => {
  const treatment = await Treatment.findById(req.params.id);
  
  if (!treatment) {
    throw new BadRequestError('Treatment not found');
  }
  
  res.status(200).json({
    success: true,
    data: treatment
  });
});

/**
 * Create a new treatment
 * @route POST /api/treatments
 * @access Private
 */
const createTreatment = asyncHandler(async (req, res) => {
  const treatment = await Treatment.create(req.body);
  
  res.status(201).json({
    success: true,
    data: treatment
  });
});

/**
 * Update a treatment
 * @route PUT /api/treatments/:id
 * @access Private
 */
const updateTreatment = asyncHandler(async (req, res) => {
  const treatment = await Treatment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!treatment) {
    throw new BadRequestError('Treatment not found');
  }
  
  res.status(200).json({
    success: true,
    data: treatment
  });
});

/**
 * Delete a treatment
 * @route DELETE /api/treatments/:id
 * @access Private
 */
const deleteTreatment = asyncHandler(async (req, res) => {
  const treatment = await Treatment.findById(req.params.id);
  
  if (!treatment) {
    throw new BadRequestError('Treatment not found');
  }
  
  await treatment.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getAllTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment
}; 