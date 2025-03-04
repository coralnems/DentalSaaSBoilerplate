const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  amount: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    insurance: {
      type: Number,
      default: 0,
      min: 0
    },
    patient: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'adjustment'],
    required: true
  },
  method: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'check', 'insurance', 'bank_transfer', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  gateway: {
    name: {
      type: String,
      enum: ['stripe', 'square', 'paypal', 'manual', 'other'],
      required: true
    },
    transactionId: String,
    chargeId: String,
    refundId: String,
    paymentIntentId: String,
    paymentMethodId: String,
    error: {
      code: String,
      message: String,
      type: String
    }
  },
  items: [{
    name: String,
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    claimNumber: String,
    preAuthNumber: String,
    coverage: {
      type: Number,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'denied', 'partially_approved'],
      default: 'pending'
    },
    submittedDate: Date,
    responseDate: Date,
    explanation: String
  },
  refunds: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: String,
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    transactionId: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: [{
    content: String,
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
  receipt: {
    number: {
      type: String,
      required: true,
      unique: true
    },
    url: String,
    sentTo: String,
    sentAt: Date
  },
  metadata: {
    type: Map,
    of: String
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for quick lookups
paymentSchema.index({ tenantId: 1, patientId: 1 });
paymentSchema.index({ tenantId: 1, 'receipt.number': 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'gateway.transactionId': 1 });
paymentSchema.index({ createdAt: 1 });

// Virtual for total refunded amount
paymentSchema.virtual('totalRefunded').get(function() {
  return this.refunds.reduce((total, refund) => {
    return total + (refund.status === 'completed' ? refund.amount : 0);
  }, 0);
});

// Method to process refund
paymentSchema.methods.processRefund = async function(refundData) {
  if (this.status === 'refunded') {
    throw new Error('Payment has already been fully refunded');
  }

  const totalRefunded = this.totalRefunded;
  const newRefundAmount = refundData.amount;

  if (totalRefunded + newRefundAmount > this.amount.total) {
    throw new Error('Refund amount exceeds payment total');
  }

  this.refunds.push(refundData);
  
  if (totalRefunded + newRefundAmount === this.amount.total) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }

  return this.save();
};

// Method to send receipt
paymentSchema.methods.sendReceipt = async function(email) {
  this.receipt.sentTo = email;
  this.receipt.sentAt = new Date();
  return this.save();
};

// Static method to generate receipt number
paymentSchema.statics.generateReceiptNumber = async function(tenantId) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  const lastReceipt = await this.findOne(
    { tenantId },
    { 'receipt.number': 1 },
    { sort: { 'receipt.number': -1 } }
  );

  let sequence = 1;
  if (lastReceipt && lastReceipt.receipt.number) {
    const lastSequence = parseInt(lastReceipt.receipt.number.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${year}${month}-${String(sequence).padStart(4, '0')}`;
};

// Middleware to generate receipt number
paymentSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.receipt.number = await this.constructor.generateReceiptNumber(this.tenantId);
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 