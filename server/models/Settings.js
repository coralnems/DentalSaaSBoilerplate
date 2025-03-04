const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true
  },
  general: {
    clinicName: {
      type: String,
      required: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  appointments: {
    defaultDuration: {
      type: Number,
      default: 30,
      min: 5,
      max: 480
    },
    bufferTime: {
      type: Number,
      default: 5,
      min: 0,
      max: 60
    },
    workingHours: {
      monday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
      },
      tuesday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
      },
      wednesday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
      },
      thursday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
      },
      friday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
      },
      saturday: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '13:00' }
      },
      sunday: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '13:00' }
      }
    },
    holidays: [{
      date: Date,
      description: String,
      recurring: { type: Boolean, default: false }
    }],
    allowOnlineBooking: {
      type: Boolean,
      default: true
    },
    minAdvanceBooking: {
      type: Number,
      default: 1, // days
      min: 0
    },
    maxAdvanceBooking: {
      type: Number,
      default: 60, // days
      min: 1
    }
  },
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      provider: {
        type: String,
        enum: ['sendgrid', 'mailchimp', 'smtp'],
        default: 'sendgrid'
      },
      config: {
        apiKey: String,
        fromEmail: String,
        fromName: String,
        templates: {
          appointmentReminder: String,
          appointmentConfirmation: String,
          appointmentCancellation: String,
          welcomeEmail: String,
          passwordReset: String,
          invoiceEmail: String
        }
      }
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: {
        type: String,
        enum: ['twilio', 'messagebird', 'custom'],
        default: 'twilio'
      },
      config: {
        accountSid: String,
        authToken: String,
        fromNumber: String,
        templates: {
          appointmentReminder: String,
          appointmentConfirmation: String,
          appointmentCancellation: String
        }
      }
    },
    reminders: {
      appointmentReminder: {
        enabled: { type: Boolean, default: true },
        timing: [{ type: Number }], // hours before appointment
        methods: [{
          type: String,
          enum: ['email', 'sms']
        }]
      },
      followUp: {
        enabled: { type: Boolean, default: true },
        timing: { type: Number, default: 24 }, // hours after appointment
        methods: [{
          type: String,
          enum: ['email', 'sms']
        }]
      }
    }
  },
  security: {
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8,
        min: 6
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      },
      expiryDays: {
        type: Number,
        default: 90,
        min: 0
      }
    },
    mfa: {
      enabled: {
        type: Boolean,
        default: false
      },
      required: {
        type: Boolean,
        default: false
      },
      methods: [{
        type: String,
        enum: ['authenticator', 'sms', 'email']
      }]
    },
    sessionTimeout: {
      type: Number,
      default: 30, // minutes
      min: 5
    },
    ipWhitelist: [String],
    loginAttempts: {
      max: {
        type: Number,
        default: 5,
        min: 3
      },
      lockoutDuration: {
        type: Number,
        default: 30, // minutes
        min: 5
      }
    }
  },
  billing: {
    paymentGateways: [{
      name: {
        type: String,
        enum: ['stripe', 'square', 'paypal']
      },
      enabled: {
        type: Boolean,
        default: false
      },
      isDefault: {
        type: Boolean,
        default: false
      },
      config: mongoose.Schema.Types.Mixed
    }],
    invoiceSettings: {
      prefix: String,
      nextNumber: {
        type: Number,
        default: 1
      },
      terms: String,
      notes: String,
      dueDays: {
        type: Number,
        default: 30
      }
    },
    taxes: [{
      name: String,
      rate: Number,
      default: {
        type: Boolean,
        default: false
      }
    }]
  },
  customization: {
    theme: {
      primary: String,
      secondary: String,
      accent: String
    },
    logo: {
      url: String,
      width: Number,
      height: Number
    },
    favicon: String,
    customCss: String
  },
  integrations: {
    storage: {
      provider: {
        type: String,
        enum: ['minio', 's3'],
        default: 'minio'
      },
      config: mongoose.Schema.Types.Mixed
    },
    analytics: {
      googleAnalytics: String,
      facebookPixel: String,
      customScript: String
    }
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
settingsSchema.index({ tenantId: 1 }, { unique: true });

// Ensure only one default payment gateway
settingsSchema.pre('save', function(next) {
  const defaultGateways = this.billing.paymentGateways.filter(gateway => gateway.isDefault);
  if (defaultGateways.length > 1) {
    next(new Error('Only one default payment gateway is allowed'));
  }
  next();
});

// Method to update settings
settingsSchema.methods.updateSettings = async function(newSettings) {
  Object.assign(this, newSettings);
  return this.save();
};

// Method to get working hours for a specific day
settingsSchema.methods.getWorkingHours = function(day) {
  const lowerDay = day.toLowerCase();
  return this.appointments.workingHours[lowerDay];
};

// Method to check if a date is a holiday
settingsSchema.methods.isHoliday = function(date) {
  const checkDate = new Date(date);
  return this.appointments.holidays.some(holiday => {
    if (holiday.recurring) {
      return holiday.date.getMonth() === checkDate.getMonth() &&
             holiday.date.getDate() === checkDate.getDate();
    }
    return holiday.date.toDateString() === checkDate.toDateString();
  });
};

// Static method to get settings by tenant
settingsSchema.statics.getByTenant = function(tenantId) {
  return this.findOne({ tenantId });
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 