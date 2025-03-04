const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DentalRecordSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  dentalChart: {
    teeth: [{
      number: Number,
      condition: {
        type: String,
        enum: [
          'Healthy',
          'Decayed',
          'Filled',
          'Crown',
          'Missing',
          'Bridge',
          'Implant',
          'Root Canal'
        ]
      },
      notes: String,
      lastUpdated: Date
    }],
    lastFullExam: Date
  },
  xrays: [{
    type: {
      type: String,
      enum: ['Panoramic', 'Bitewing', 'Periapical', 'Full Mouth Series']
    },
    date: Date,
    imageUrl: String,
    notes: String,
    takenBy: String
  }],
  periodontalChart: {
    pocketDepths: [{
      date: Date,
      measurements: Map,  // tooth number -> measurements
      notes: String
    }],
    bleedingPoints: [{
      date: Date,
      points: [Number]
    }]
  },
  treatments: [{
    type: Schema.Types.ObjectId,
    ref: 'Treatment'
  }],
  notes: [{
    date: {
      type: Date,
      default: Date.now
    },
    content: String,
    author: String
  }],
  allergies: [{
    type: String,
    severity: String,
    notes: String
  }],
  medicalAlerts: [{
    type: String,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    notes: String,
    date: Date
  }],
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
DentalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient querying
DentalRecordSchema.index({ patient: 1 });
DentalRecordSchema.index({ 'xrays.date': -1 });

module.exports = mongoose.model('DentalRecord', DentalRecordSchema); 