const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  dentist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['checkup', 'cleaning', 'filling', 'extraction', 'root-canal', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'low'
  },
  reminders: [{
    type: String,
    enum: ['email', 'sms', 'phone'],
    default: ['email']
  }],
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'phone']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'failed', 'delivered']
    }
  }],
  cancellationReason: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
appointmentSchema.index({ patient: 1, startTime: 1 });
appointmentSchema.index({ dentist: 1, startTime: 1 });
appointmentSchema.index({ tenantId: 1, startTime: 1 });
appointmentSchema.index({ status: 1 });

// Virtual for appointment duration in minutes
appointmentSchema.virtual('duration').get(function() {
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

// Pre-save middleware to validate appointment times
appointmentSchema.pre('save', async function(next) {
  if (this.startTime >= this.endTime) {
    throw new Error('End time must be after start time');
  }

  // Check for overlapping appointments for the dentist
  const overlapping = await this.constructor.findOne({
    dentist: this.dentist,
    _id: { $ne: this._id },
    status: { $nin: ['cancelled', 'completed'] },
    $or: [
      {
        startTime: { $lt: this.endTime },
        endTime: { $gt: this.startTime }
      }
    ]
  });

  if (overlapping) {
    throw new Error('This time slot overlaps with another appointment');
  }

  next();
});

// Method to check dentist availability
appointmentSchema.statics.checkAvailability = async function(dentistId, startTime, endTime) {
  const overlapping = await this.findOne({
    dentist: dentistId,
    status: { $nin: ['cancelled', 'completed'] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  });

  return !overlapping;
};

// Method to get available slots for a dentist on a specific day
appointmentSchema.statics.getAvailableSlots = async function(dentistId, date, duration = 30) {
  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0); // Clinic opens at 9 AM

  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0); // Clinic closes at 5 PM

  const bookedAppointments = await this.find({
    dentist: dentistId,
    status: { $nin: ['cancelled', 'completed'] },
    startTime: { $gte: startOfDay },
    endTime: { $lte: endOfDay }
  }).sort('startTime');

  const availableSlots = [];
  let currentTime = startOfDay;

  while (currentTime < endOfDay) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    
    const isOverlapping = bookedAppointments.some(appointment => 
      (currentTime < appointment.endTime && slotEnd > appointment.startTime)
    );

    if (!isOverlapping && slotEnd <= endOfDay) {
      availableSlots.push({
        startTime: new Date(currentTime),
        endTime: slotEnd
      });
    }

    currentTime = slotEnd;
  }

  return availableSlots;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 