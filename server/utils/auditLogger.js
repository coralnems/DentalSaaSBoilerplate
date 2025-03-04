const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({
  userId,
  action,
  resource,
  resourceId,
  description,
  tenantId,
  changes,
  metadata,
  severity = 'info'
}) => {
  try {
    const log = await AuditLog.createLog({
      userId,
      action,
      resource,
      resourceId,
      description,
      tenantId,
      changes,
      metadata: {
        ...metadata,
        userAgent: global.requestContext?.userAgent,
        ipAddress: global.requestContext?.ipAddress,
        location: global.requestContext?.location,
        device: global.requestContext?.device
      },
      severity,
      timestamp: new Date()
    });

    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break the main flow
    return null;
  }
};

const getAuditLogs = async ({
  tenantId,
  userId,
  action,
  resource,
  severity,
  startDate,
  endDate,
  page = 1,
  limit = 10
}) => {
  try {
    const query = { tenantId };

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email'),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

const getSecurityAuditLogs = async ({
  tenantId,
  startDate,
  endDate,
  page = 1,
  limit = 10
}) => {
  try {
    const query = {
      tenantId,
      $or: [
        { severity: { $in: ['high', 'critical'] } },
        { action: { $in: ['LOGIN_FAILED', 'SECURITY_ALERT'] } }
      ]
    };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email'),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching security audit logs:', error);
    throw error;
  }
};

const getAuditLogsByResource = async ({
  tenantId,
  resourceId,
  page = 1,
  limit = 10
}) => {
  try {
    const query = {
      tenantId,
      resourceId
    };

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email'),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching resource audit logs:', error);
    throw error;
  }
};

const getAuditLogStats = async ({
  tenantId,
  startDate,
  endDate
}) => {
  try {
    const query = { tenantId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const stats = await AuditLog.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          criticalLogs: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          highLogs: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          },
          mediumLogs: {
            $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] }
          },
          lowLogs: {
            $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] }
          },
          infoLogs: {
            $sum: { $cond: [{ $eq: ['$severity', 'info'] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      totalLogs: 0,
      criticalLogs: 0,
      highLogs: 0,
      mediumLogs: 0,
      lowLogs: 0,
      infoLogs: 0
    };
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    throw error;
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getSecurityAuditLogs,
  getAuditLogsByResource,
  getAuditLogStats
}; 