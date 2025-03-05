const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Appointment Schema
 */
const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
      index: true
    },
    dentist: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dentist is required'],
      index: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },
    type: {
      type: String,
      enum: ['checkup', 'cleaning', 'emergency', 'surgery', 'consultation', 'follow-up', 
             'filling', 'extraction', 'root-canal', 'crown', 'bridge', 'implant', 'orthodontic', 'other'],
      required: [true, 'Appointment type is required']
    },
    reason: {
      type: String,
      required: true
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'low'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    treatment: {
      type: Schema.Types.ObjectId,
      ref: 'Treatment'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create indexes for efficient querying
appointmentSchema.index({ patient: 1, startTime: -1 });
appointmentSchema.index({ dentist: 1, startTime: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ startTime: 1 });
// Compound index for checking conflicts
appointmentSchema.index({ dentist: 1, startTime: 1, endTime: 1 });

// Virtual for appointment duration in minutes
appointmentSchema.virtual('durationMinutes').get(function() {
  if (!this.startTime || !this.endTime) return 0;
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

// Pre-save hook to validate appointment times
appointmentSchema.pre('save', function(next) {
  // Ensure end time is after start time
  if (this.startTime >= this.endTime) {
    return next(new Error('Appointment end time must be after start time'));
  }
  
  // Ensure appointments don't span multiple days
  const startDay = new Date(this.startTime).setHours(0, 0, 0, 0);
  const endDay = new Date(this.endTime).setHours(0, 0, 0, 0);
  
  if (startDay !== endDay) {
    return next(new Error('Appointments cannot span multiple days'));
  }
  
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 