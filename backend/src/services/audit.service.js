const prisma = require('../utils/prisma');

/**
 * Audit Service
 * Centralised function to log any entity change into AuditLog
 * Called from every module's service layer (FR-068, FR-069)
 */
class AuditService {
  /**
   * Log an audit entry
   * @param {Object} options - Audit log options
   * @param {string} options.entity - Entity name (e.g., 'Stock', 'Batch')
   * @param {number|string} options.entityId - ID of the affected entity
   * @param {string} options.action - Action performed (CREATE, UPDATE, DELETE, QUARANTINE, etc.)
   * @param {number} options.userId - ID of the user who performed the action
   * @param {Object} [options.previousState] - Previous state of the entity
   * @param {Object} [options.newState] - New state of the entity
   * @param {string} [options.reason] - Reason for the change (optional)
   * @param {string} [options.ipAddress] - IP address of the request
   * @returns {Promise<Object>} - Created audit log entry
   */
  async log(options) {
    const {
      entity,
      entityId,
      action,
      userId,
      previousState,
      newState,
      reason,
      ipAddress,
    } = options;

    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          entity,
          entityId: String(entityId),
          action,
          userId,
          previousState: previousState || {},
          newState: newState || {},
          reason: reason || null,
          ipAddress: ipAddress || null,
          timestamp: new Date(),
        },
      });

      return auditLog;
    } catch (error) {
      // Don't throw error if audit logging fails - it shouldn't break the main operation
      console.error('Failed to create audit log:', error);
      return null;
    }
  }

  /**
   * Log batch event (for blockchain/event stream - FR-083)
   * @param {Object} options - Event options
   * @param {number} options.batchId - Batch ID
   * @param {string} options.eventType - Event type (RECEIVED, QUARANTINED, RELEASED, RECALLED, etc.)
   * @param {number} options.userId - User ID
   * @param {Object} [options.metadata] - Additional event metadata
   * @returns {Promise<Object>} - Created batch event
   */
  async logBatchEvent(options) {
    const { batchId, eventType, userId, metadata } = options;

    try {
      const batchEvent = await prisma.batchEvent.create({
        data: {
          batchId,
          eventType,
          userId,
          metadata: metadata || {},
          timestamp: new Date(),
        },
      });

      return batchEvent;
    } catch (error) {
      console.error('Failed to create batch event:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for an entity
   * @param {string} entity - Entity name
   * @param {number|string} entityId - Entity ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of audit logs
   */
  async getEntityAuditLogs(entity, entityId, options = {}) {
    const { page = 1, limit = 50, action, userId, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const where = {
      entity,
      entityId: String(entityId),
    };

    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom);
      if (dateTo) where.timestamp.lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get audit logs for a user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of audit logs
   */
  async getUserAuditLogs(userId, options = {}) {
    const { page = 1, limit = 50, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const where = { userId };

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom);
      if (dateTo) where.timestamp.lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new AuditService();
