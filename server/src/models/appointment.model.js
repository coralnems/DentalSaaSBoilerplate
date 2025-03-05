const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dentist: {
    type: Schema.Types.ObjectId,
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
    enum: ['checkup', 'cleaning', 'filling', 'extraction', 'root-canal', 'crown', 'bridge', 'implant', 'orthodontic', 'emergency', 'consultation', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
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
    default: ''
  },
  cancellationReason: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for efficient querying
appointmentSchema.index({ patient: 1, startTime: -1 });
appointmentSchema.index({ dentist: 1, startTime: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ startTime: 1 });

// Virtual for appointment duration in minutes
appointmentSchema.virtual('duration').get(function() {
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 