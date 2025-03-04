const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  },
  plan: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    required: true
  },
  features: {
    appointmentReminders: { type: Boolean, default: true },
    onlineBooking: { type: Boolean, default: true },
    electronicRecords: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    multipleLocations: { type: Boolean, default: false }
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    businessHours: {
      monday: {
        start: String,
        end: String,
        closed: { type: Boolean, default: false }
      },
      tuesday: {
        start: String,
        end: String,
        closed: { type: Boolean, default: false }
      },
      wednesday: {
        start: String,
        end: String,
        closed: { type: Boolean, default: false }
      },
      thursday: {
        start: String,
        end: String,
        closed: { type: Boolean, default: false }
      },
      friday: {
        start: String,
        end: String,
        closed: { type: Boolean, default: false }
      },
      saturday: {
        start: String,
        end: String,
        closed: { type: Boolean, default: true }
      },
      sunday: {
        start: String,
        end: String,
        closed: { type: Boolean, default: true }
      }
    },
    appointmentDuration: {
      type: Number,
      default: 30 // minutes
    }
  },
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  billing: {
    customerId: String,
    subscriptionId: String,
    plan: {
      id: String,
      name: String,
      price: Number,
      interval: String
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled'],
      default: 'active'
    },
    nextBillingDate: Date
  },
  storage: {
    provider: {
      type: String,
      enum: ['minio', 's3'],
      default: 'minio'
    },
    bucket: String,
    usage: {
      current: { type: Number, default: 0 }, // in bytes
      limit: { type: Number, default: 5368709120 } // 5GB default
    }
  },
  customization: {
    logo: String,
    colors: {
      primary: String,
      secondary: String,
      accent: String
    },
    customCss: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ subdomain: 1 }, { unique: true });
tenantSchema.index({ status: 1 });
tenantSchema.index({ 'billing.status': 1 });

// Pre-save middleware to generate storage bucket name
tenantSchema.pre('save', function(next) {
  if (!this.storage.bucket) {
    this.storage.bucket = `tenant-${this._id}`;
  }
  next();
});

// Instance method to check if tenant is active
tenantSchema.methods.isActive = function() {
  return this.status === 'active' && this.billing.status === 'active';
};

// Instance method to check if tenant has feature
tenantSchema.methods.hasFeature = function(featureName) {
  return this.features[featureName] === true;
};

// Instance method to update storage usage
tenantSchema.methods.updateStorageUsage = async function(bytesUsed) {
  this.storage.usage.current += bytesUsed;
  if (this.storage.usage.current < 0) {
    this.storage.usage.current = 0;
  }
  await this.save();
};

// Static method to find tenant by subdomain
tenantSchema.statics.findBySubdomain = function(subdomain) {
  return this.findOne({ subdomain: subdomain.toLowerCase() });
};

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant; 