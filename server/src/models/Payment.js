const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'credit_card', 'debit_card', 'insurance', 'bank_transfer', 'check', 'other'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [
      {
        treatmentId: {
          type: Schema.Types.ObjectId,
          ref: 'Treatment',
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        discount: {
          type: Number,
          default: 0,
          min: 0,
        },
        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    insuranceCoverage: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
PaymentSchema.index({ patientId: 1 });
PaymentSchema.index({ appointmentId: 1 });
PaymentSchema.index({ paymentDate: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ 'items.treatmentId': 1 });

module.exports = mongoose.model('Payment', PaymentSchema); 