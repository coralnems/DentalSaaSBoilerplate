const appointmentService = require('../services/appointmentService');
const { BadRequestError } = require('../utils/errors');
const { asyncHandler } = require('../middleware/asyncHandler');
const Appointment = require('../models/Appointment');

/**
 * Get all appointments with optional filtering
 * @route GET /api/appointments
 * @access Private
 */
const getAllAppointments = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    patientId: req.query.patientId,
    dentistId: req.query.dentistId,
    status: req.query.status
  };
  
  const appointments = await appointmentService.getAllAppointments(filters);
  
  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

/**
 * Get an appointment by ID
 * @route GET /api/appointments/:id
 * @access Private
 */
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: appointment
  });
});

/**
 * Create a new appointment
 * @route POST /api/appointments
 * @access Private
 */
const createAppointment = asyncHandler(async (req, res) => {
  // Validate required fields
  const { patientId, dentistId, startTime, endTime, type } = req.body;
  
  if (!patientId || !dentistId || !startTime || !endTime || !type) {
    throw new BadRequestError('Please provide all required fields: patientId, dentistId, startTime, endTime, type');
  }
  
  // Parse dates
  const appointmentData = {
    ...req.body,
    startTime: new Date(startTime),
    endTime: new Date(endTime)
  };
  
  // Check if startTime is before endTime
  if (appointmentData.startTime >= appointmentData.endTime) {
    throw new BadRequestError('Start time must be before end time');
  }
  
  const appointment = await appointmentService.createAppointment(appointmentData);
  
  res.status(201).json({
    success: true,
    data: appointment
  });
});

/**
 * Update an appointment
 * @route PUT /api/appointments/:id
 * @access Private
 */
const updateAppointment = asyncHandler(async (req, res) => {
  // Parse dates if provided
  const updateData = { ...req.body };
  
  if (updateData.startTime) {
    updateData.startTime = new Date(updateData.startTime);
  }
  
  if (updateData.endTime) {
    updateData.endTime = new Date(updateData.endTime);
  }
  
  // Check if dates are valid
  if (updateData.startTime && updateData.endTime && updateData.startTime >= updateData.endTime) {
    throw new BadRequestError('Start time must be before end time');
  }
  
  const appointment = await appointmentService.updateAppointment(req.params.id, updateData);
  
  res.status(200).json({
    success: true,
    data: appointment
  });
});

/**
 * Delete an appointment
 * @route DELETE /api/appointments/:id
 * @access Private
 */
const deleteAppointment = asyncHandler(async (req, res) => {
  await appointmentService.deleteAppointment(req.params.id);
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * Get appointments for a specific patient
 * @route GET /api/patients/:patientId/appointments
 * @access Private
 */
const getPatientAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getPatientAppointments(req.params.patientId);
  
  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

/**
 * Get appointments for a specific dentist
 * @route GET /api/dentists/:dentistId/appointments
 * @access Private
 */
const getDentistAppointments = asyncHandler(async (req, res) => {
  const filters = {
    date: req.query.date,
    status: req.query.status
  };
  
  const appointments = await appointmentService.getDentistAppointments(req.params.dentistId, filters);
  
  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

/**
 * Get appointments by date range
 * @route GET /api/appointments/date-range
 * @access Private
 */
const getByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const appointments = await Appointment.find({
    startTime: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
  .populate('patient', 'firstName lastName email phone')
  .populate('dentist', 'firstName lastName');

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

/**
 * Cancel an appointment
 * @route POST /api/appointments/:id/cancel
 * @access Private
 */
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    throw new BadRequestError('Appointment not found');
  }

  appointment.status = 'cancelled';
  appointment.cancellationReason = req.body.reason || 'No reason provided';
  
  await appointment.save();
  
  res.status(200).json({
    success: true,
    data: appointment
  });
});

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPatientAppointments,
  getDentistAppointments,
  getByDateRange,
  cancelAppointment
}; 