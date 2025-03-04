const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TreatmentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Cleaning',
      'Filling',
      'Root Canal',
      'Crown',
      'Bridge',
      'Extraction',
      'Implant',
      'Veneer',
      'Whitening',
      'Other'
    ]
  },
  teeth: [{
    number: Number,
    condition: String,
    procedure: String
  }],
  diagnosis: {
    type: String,
    required: true
  },
  procedure: {
    type: String,
    required: true
  },
  materials: [{
    name: String,
    quantity: Number
  }],
  cost: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    insurance: {
      covered: Boolean,
      amount: Number
    }
  },
  notes: String,
  attachments: [{
    type: String, // URL or file path
    description: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Planned'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
TreatmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient querying
TreatmentSchema.index({ patient: 1, createdAt: -1 });
TreatmentSchema.index({ status: 1 });

module.exports = mongoose.model('Treatment', TreatmentSchema); 