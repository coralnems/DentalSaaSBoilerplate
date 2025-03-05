const BaseController = require('./base.controller');
const Appointment = require('../models/appointment.model');

class AppointmentController extends BaseController {
  constructor() {
    super(Appointment);
  }

  // Get appointments by date range
  async getByDateRange(req) {
    const { startDate, endDate } = req.query;
    
    const appointments = await this.model.find({
      startTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('patient', 'firstName lastName email phone')
    .populate('dentist', 'firstName lastName');

    return {
      appointments,
      pagination: {
        total: appointments.length,
        page: 1,
        limit: appointments.length
      }
    };
  }

  // Get appointments by dentist
  async getByDentist(req) {
    const appointments = await this.model.find({
      dentist: req.params.dentistId,
      startTime: { $gte: new Date() }
    })
    .populate('patient', 'firstName lastName email phone');

    return {
      appointments,
      pagination: {
        total: appointments.length,
        page: 1,
        limit: appointments.length
      }
    };
  }

  // Get appointments by patient
  async getByPatient(req) {
    const appointments = await this.model.find({
      patient: req.params.patientId
    })
    .populate('dentist', 'firstName lastName');

    return {
      appointments,
      pagination: {
        total: appointments.length,
        page: 1,
        limit: appointments.length
      }
    };
  }

  // Cancel appointment
  async cancelAppointment(req) {
    const appointment = await this.model.findById(req.params.id);
    
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || 'No reason provided';
    
    await appointment.save();
    return appointment;
  }

  // Override findAll to properly populate and format 
  async findAll(req) {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'scheduled';
    const search = req.query.search || '';
    
    // Build the query
    const query = { status };
    
    // Add date filters if provided
    if (req.query.startDate) {
      query.startTime = query.startTime || {};
      query.startTime.$gte = new Date(req.query.startDate);
    }
    
    if (req.query.endDate) {
      query.startTime = query.startTime || {};
      query.startTime.$lte = new Date(req.query.endDate);
    }
    
    // Add search conditions if provided
    if (search) {
      // Create a simplified search (in a real app, we would use more robust search)
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { 'patient.firstName': searchRegex },
        { 'patient.lastName': searchRegex },
        { 'dentist.firstName': searchRegex },
        { 'dentist.lastName': searchRegex },
        { type: searchRegex }
      ];
    }

    // Execute query with pagination
    const appointments = await this.model.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('dentist', 'firstName lastName')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit);
      
    // Get total count for pagination
    const total = await this.model.countDocuments(query);
    
    return {
      appointments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Override findOne to populate related fields
  async findOne(req) {
    const appointment = await this.model.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('dentist', 'firstName lastName');
      
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }
    
    return appointment;
  }
}

module.exports = AppointmentController; 