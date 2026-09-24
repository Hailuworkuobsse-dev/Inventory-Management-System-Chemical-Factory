const prisma = require('../utils/prisma');

/**
 * Log an audit entry for any entity change
 * @param {Object} options - Audit log options
 * @param {number} options.userId - ID of the user performing the action
 * @param {string} options.action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {string} options.entity - Entity type (e.g., 'Stock', 'Batch', 'PurchaseOrder')
 * @param {number} options.entityId - ID of the affected entity
 * @param {Object} [options.oldValue] - Previous state of the entity
 * @param {Object} [options.newValue] - New state of the entity
 * @param {string} [options.reason] - Optional reason for the action
 * @returns {Promise<Object>} Created audit log entry
 */
const logAudit = async ({ userId, action, entity, entityId, oldValue, newValue, reason }) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue || null,
        newValue: newValue || null,
        reason: reason || null
      }
    });

    console.log(`Audit: ${action} on ${entity}#${entityId} by user #${userId}`);
    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not block main operation
    return null;
  }
};

/**
 * Log batch status change with full traceability
 * @param {number} userId - User ID
 * @param {number} batchId - Batch ID
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} [reason] - Reason for status change
 * @returns {Promise<Object>} Audit log entry
 */
const logBatchStatusChange = async (userId, batchId, oldStatus, newStatus, reason) => {
  return logAudit({
    userId,
    action: 'STATUS_CHANGE',
    entity: 'Batch',
    entityId: batchId,
    oldValue: { status: oldStatus },
    newValue: { status: newStatus },
    reason
  });
};

/**
 * Log stock movement
 * @param {Object} options - Stock movement audit options
 * @returns {Promise<Object>} Audit log entry
 */
const logStockMovement = async ({ userId, stockId, action, quantity, reason, oldValue, newValue }) => {
  return logAudit({
    userId,
    action,
    entity: 'Stock',
    entityId: stockId,
    oldValue,
    newValue,
    reason
  });
};

/**
 * Get audit logs for an entity
 * @param {string} entity - Entity type
 * @param {number} entityId - Entity ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of audit logs
 */
const getEntityAuditLogs = async (entity, entityId, options = {}) => {
  const { limit = 50, offset = 0, action } = options;

  const where = {
    entity,
    entityId
  };

  if (action) {
    where.action = action;
  }

  return prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          employeeId: true
        }
      }
    },
    orderBy: { timestamp: 'desc' },
    skip: offset,
    take: limit
  });
};

/**
 * Get user activity logs
 * @param {number} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of audit logs
 */
const getUserActivityLogs = async (userId, options = {}) => {
  const { limit = 50, offset = 0, startDate, endDate } = options;

  const where = { userId };

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  return prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          employeeId: true
        }
      }
    },
    orderBy: { timestamp: 'desc' },
    skip: offset,
    take: limit
  });
};

module.exports = {
  logAudit,
  logBatchStatusChange,
  logStockMovement,
  getEntityAuditLogs,
  getUserActivityLogs
};
