const Appointment = require('../models/Appointment');
const { AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');

// Get all appointments with filtering and pagination
exports.getAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { tenantId: req.user.tenantId };
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.dentist) filter.dentist = req.query.dentist;
    if (req.query.patient) filter.patient = req.query.patient;
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.startTime = {};
      if (req.query.startDate) {
        filter.startTime.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.startTime.$lte = new Date(req.query.endDate);
      }
    }

    // Get appointments with populated references
    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName email phone')
      .populate('dentist', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ startTime: 1 });

    // Get total count for pagination
    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    throw new AppError('Failed to fetch appointments', 500);
  }
};

// Get single appointment
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    })
    .populate('patient', 'firstName lastName email phone')
    .populate('dentist', 'firstName lastName');

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    res.json(appointment);
  } catch (error) {
    throw new AppError('Failed to fetch appointment', 500);
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    // Check for availability
    const isAvailable = await Appointment.checkAvailability(
      req.body.dentist,
      new Date(req.body.startTime),
      new Date(req.body.endTime)
    );

    if (!isAvailable) {
      throw new AppError('Selected time slot is not available', 400);
    }

    const appointmentData = {
      ...req.body,
      tenantId: req.user.tenantId,
      createdBy: req.user._id
    };

    const appointment = await Appointment.create(appointmentData);

    await createAuditLog({
      userId: req.user._id,
      action: 'APPOINTMENT_CREATED',
      resource: 'appointment',
      resourceId: appointment._id,
      details: `Created appointment for patient: ${appointment.patient}`,
      tenantId: req.user.tenantId
    });

    res.status(201).json(appointment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new AppError(error.message, 400);
    }
    throw new AppError('Failed to create appointment', 500);
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    // If updating time, check for availability
    if (req.body.startTime || req.body.endTime) {
      const appointment = await Appointment.findById(req.params.id);
      const isAvailable = await Appointment.checkAvailability(
        req.body.dentist || appointment.dentist,
        new Date(req.body.startTime || appointment.startTime),
        new Date(req.body.endTime || appointment.endTime)
      );

      if (!isAvailable) {
        throw new AppError('Selected time slot is not available', 400);
      }
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'APPOINTMENT_UPDATED',
      resource: 'appointment',
      resourceId: appointment._id,
      details: `Updated appointment for patient: ${appointment.patient}`,
      tenantId: req.user.tenantId
    });

    res.json(appointment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new AppError(error.message, 400);
    }
    throw new AppError('Failed to update appointment', 500);
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId,
        status: { $nin: ['completed', 'cancelled'] }
      },
      {
        status: 'cancelled',
        cancellationReason: req.body.reason
      },
      { new: true }
    );

    if (!appointment) {
      throw new AppError('Appointment not found or cannot be cancelled', 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'APPOINTMENT_CANCELLED',
      resource: 'appointment',
      resourceId: appointment._id,
      details: `Cancelled appointment for patient: ${appointment.patient}`,
      tenantId: req.user.tenantId
    });

    res.json(appointment);
  } catch (error) {
    throw new AppError('Failed to cancel appointment', 500);
  }
};

// Get available slots for a dentist
exports.getAvailableSlots = async (req, res) => {
  try {
    const { dentistId, date, duration } = req.query;
    
    if (!dentistId || !date) {
      throw new AppError('Dentist ID and date are required', 400);
    }

    const slots = await Appointment.getAvailableSlots(
      dentistId,
      new Date(date),
      parseInt(duration) || 30
    );

    res.json(slots);
  } catch (error) {
    throw new AppError('Failed to fetch available slots', 500);
  }
}; 