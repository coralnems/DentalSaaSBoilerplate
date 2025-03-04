const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  medicalHistory: {
    allergies: [{
      type: String,
      trim: true
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String
    }],
    conditions: [{
      type: String,
      trim: true
    }],
    surgeries: [{
      procedure: String,
      date: Date,
      notes: String
    }]
  },
  dentalHistory: {
    lastVisit: Date,
    lastCleaning: Date,
    lastXRay: Date,
    previousDentist: {
      name: String,
      phone: String,
      address: String
    }
  },
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    groupNumber: {
      type: String,
      trim: true
    },
    primaryInsured: {
      name: String,
      relationship: String,
      dateOfBirth: Date
    }
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },
  communicationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    phone: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    }
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

// Indexes
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ tenantId: 1 });
patientSchema.index({ 'insurance.policyNumber': 1 });

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
patientSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Pre-save middleware to format phone numbers
patientSchema.pre('save', function(next) {
  // Format phone numbers (remove non-numeric characters)
  this.phone = this.phone.replace(/\D/g, '');
  if (this.emergencyContact.phone) {
    this.emergencyContact.phone = this.emergencyContact.phone.replace(/\D/g, '');
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient; 