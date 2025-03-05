const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Treatment Schema
 */
const treatmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Treatment name is required'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Treatment price is required'],
      min: [0, 'Price cannot be negative']
    },
    duration: {
      type: Number,
      required: [true, 'Treatment duration is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      default: 30
    },
    category: {
      type: String,
      enum: ['preventive', 'restorative', 'cosmetic', 'orthodontic', 'surgical', 'other'],
      default: 'other'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requiredEquipment: [String],
    notes: {
      type: String,
      trim: true,
    },
    code: {
      type: String, // For insurance/billing codes
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted price
treatmentSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for formatted duration
treatmentSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  }
  
  return `${minutes}m`;
});

// Create indexes for faster queries
treatmentSchema.index({ name: 1 });
treatmentSchema.index({ category: 1 });
treatmentSchema.index({ price: 1 });

const Treatment = mongoose.model('Treatment', treatmentSchema);

module.exports = Treatment; 