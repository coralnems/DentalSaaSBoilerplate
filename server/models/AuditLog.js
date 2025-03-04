const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication actions
      'USER_LOGIN',
      'USER_LOGOUT',
      'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET_COMPLETE',
      'MFA_ENABLED',
      'MFA_DISABLED',
      'LOGIN_FAILED',
      
      // User management actions
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'USER_ROLE_CHANGED',
      'USER_PERMISSIONS_UPDATED',
      'USER_STATUS_CHANGED',
      
      // Patient actions
      'PATIENT_CREATED',
      'PATIENT_UPDATED',
      'PATIENT_DELETED',
      'PATIENT_ARCHIVED',
      'MEDICAL_HISTORY_UPDATED',
      'DENTAL_HISTORY_UPDATED',
      
      // Appointment actions
      'APPOINTMENT_CREATED',
      'APPOINTMENT_UPDATED',
      'APPOINTMENT_CANCELLED',
      'APPOINTMENT_COMPLETED',
      'APPOINTMENT_RESCHEDULED',
      'NO_SHOW_RECORDED',
      
      // Payment actions
      'PAYMENT_PROCESSED',
      'PAYMENT_FAILED',
      'REFUND_PROCESSED',
      'INSURANCE_CLAIM_SUBMITTED',
      'INSURANCE_CLAIM_UPDATED',
      
      // Document actions
      'DOCUMENT_UPLOADED',
      'DOCUMENT_DOWNLOADED',
      'DOCUMENT_DELETED',
      'DOCUMENT_SHARED',
      
      // Settings actions
      'SETTINGS_UPDATED',
      'FEATURE_ENABLED',
      'FEATURE_DISABLED',
      
      // System actions
      'BACKUP_CREATED',
      'SYSTEM_UPDATED',
      'ERROR_OCCURRED',
      'SECURITY_ALERT'
    ]
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    location: {
      city: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    device: {
      type: String,
      os: String,
      browser: String
    }
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  severity: {
    type: String,
    enum: ['info', 'low', 'medium', 'high', 'critical'],
    default: 'info'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for quick lookups and filtering
auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, action: 1 });
auditLogSchema.index({ tenantId: 1, userId: 1 });
auditLogSchema.index({ tenantId: 1, resource: 1 });
auditLogSchema.index({ tenantId: 1, severity: 1 });
auditLogSchema.index({ 'metadata.ipAddress': 1 });

// Static method to create audit log entry
auditLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

// Static method to find security incidents
auditLogSchema.statics.findSecurityIncidents = function(tenantId, startDate, endDate) {
  return this.find({
    tenantId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    },
    $or: [
      { severity: { $in: ['high', 'critical'] } },
      { action: { $in: ['LOGIN_FAILED', 'SECURITY_ALERT'] } }
    ]
  }).sort({ timestamp: -1 });
};

// Static method to get activity summary
auditLogSchema.statics.getActivitySummary = async function(tenantId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        tenantId: mongoose.Types.ObjectId(tenantId),
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        successCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
          }
        },
        failureCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failure'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Method to add additional metadata
auditLogSchema.methods.addMetadata = function(metadata) {
  this.metadata = { ...this.metadata, ...metadata };
  return this.save();
};

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog; 