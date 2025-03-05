const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PatientSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'USA',
      },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
    },
    medicalHistory: {
      allergies: [String],
      medications: [String],
      conditions: [String],
      notes: String,
    },
    insuranceInfo: {
      provider: {
        type: String,
        trim: true,
      },
      policyNumber: {
        type: String,
        trim: true,
      },
      groupNumber: {
        type: String,
        trim: true,
      },
      primaryInsured: {
        type: String,
        trim: true,
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
PatientSchema.index({ lastName: 1, firstName: 1 });
PatientSchema.index({ email: 1 });
PatientSchema.index({ phone: 1 });
PatientSchema.index({ userId: 1 });

// Virtual for patient's full name
PatientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to transform the patient object for JSON responses
PatientSchema.methods.toJSON = function () {
  const patient = this.toObject();
  patient.fullName = this.fullName;
  return patient;
};

module.exports = mongoose.model('Patient', PatientSchema); 