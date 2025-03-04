const BaseController = require('./BaseController');
const Appointment = require('../models/Appointment');
const { AppError } = require('../middleware/errorHandler');

class AppointmentController extends BaseController {
  constructor() {
    super(Appointment, 'appointment');
  }

  // Override findAll to add appointment-specific search fields
  async findAll(req) {
    // Add searchable fields for appointments
    this.model.schema.obj.searchableFields = [
      'type',
      'status',
      'room',
      'notes.preAppointment',
      'notes.postAppointment'
    ];
    return super.findAll(req);
  }

  // Get appointments by date range
  async getByDateRange(req) {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const appointments = await this.model.find({
      tenantId: req.user.tenantId,
      startTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('patientId', 'firstName lastName')
      .populate('dentistId', 'firstName lastName');

    return appointments;
  }

  // Get appointments by dentist
  async getByDentist(req) {
    const appointments = await this.model.find({
      tenantId: req.user.tenantId,
      dentistId: req.params.dentistId,
      startTime: { $gte: new Date() }
    }).populate('patientId', 'firstName lastName');

    return appointments;
  }

  // Get appointments by patient
  async getByPatient(req) {
    const appointments = await this.model.find({
      tenantId: req.user.tenantId,
      patientId: req.params.patientId
    }).populate('dentistId', 'firstName lastName');

    return appointments;
  }

  // Check for appointment conflicts
  async checkConflicts(req) {
    const { dentistId, startTime, endTime } = req.body;
    
    const conflicts = await this.model.findConflicting(
      req.user.tenantId,
      dentistId,
      new Date(startTime),
      new Date(endTime)
    );

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  // Cancel appointment
  async cancelAppointment(req) {
    const appointment = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (!appointment.canBeCancelled()) {
      throw new AppError('Appointment cannot be cancelled', 400);
    }

    await appointment.cancel(req.user._id, req.body.reason);
    return appointment;
  }

  // Reschedule appointment
  async rescheduleAppointment(req) {
    const appointment = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const { newDate, reason } = req.body;
    await appointment.reschedule(new Date(newDate), req.user._id, reason);
    return appointment;
  }

  // Complete appointment
  async completeAppointment(req) {
    const appointment = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    await appointment.complete(req.body);
    return appointment;
  }

  // Get appointment statistics
  async getStatistics(req) {
    const { startDate, endDate } = req.query;
    const matchQuery = {
      tenantId: req.user.tenantId
    };

    if (startDate && endDate) {
      matchQuery.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await this.model.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShow: {
            $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
          },
          revenue: {
            $sum: '$billing.actual.total'
          }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      revenue: 0
    };
  }

  // Get available time slots
  async getAvailableSlots(req) {
    const { date, dentistId } = req.query;
    if (!date || !dentistId) {
      throw new AppError('Date and dentist ID are required', 400);
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.model.find({
      tenantId: req.user.tenantId,
      dentistId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no-show'] }
    }).sort('startTime');

    // Get working hours from settings
    // This is a simplified version - you would typically get this from your settings
    const workingHours = {
      start: '09:00',
      end: '17:00',
      slotDuration: 30 // minutes
    };

    const slots = [];
    let currentTime = new Date(startOfDay);
    currentTime.setHours(parseInt(workingHours.start.split(':')[0]));
    currentTime.setMinutes(parseInt(workingHours.start.split(':')[1]));

    const endTime = new Date(startOfDay);
    endTime.setHours(parseInt(workingHours.end.split(':')[0]));
    endTime.setMinutes(parseInt(workingHours.end.split(':')[1]));

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + workingHours.slotDuration * 60000);
      
      const isAvailable = !appointments.some(apt => {
        return (currentTime >= apt.startTime && currentTime < apt.endTime) ||
               (slotEnd > apt.startTime && slotEnd <= apt.endTime);
      });

      if (isAvailable) {
        slots.push({
          startTime: new Date(currentTime),
          endTime: slotEnd
        });
      }

      currentTime = slotEnd;
    }

    return slots;
  }
}

module.exports = new AppointmentController(); 