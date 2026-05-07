const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../utils/customErrors');
const notificationService = require('../../services/notification.service');

const prisma = new PrismaClient();

/**
 * Create an alert
 */
async function createAlert(data, userId) {
  const { type, severity, title, message, entityId, entityType, warehouseId } = data;

  const alert = await prisma.alert.create({
    data: {
      type,
      severity,
      title,
      message,
      entityId,
      entityType,
      warehouseId,
      status: 'ACTIVE',
      createdBy: userId
    },
    include: { warehouse: true }
  });

  // Send notifications for high/critical alerts
  if (severity === 'HIGH' || severity === 'CRITICAL') {
    await notificationService.sendAlertNotification(alert);
  }

  return alert;
}

/**
 * Update alert status
 */
async function updateAlertStatus(alertId, status, resolutionNotes, userId) {
  const alert = await prisma.alert.update({
    where: { id: alertId },
    data: {
      status,
      resolutionNotes,
      resolvedAt: status === 'RESOLVED' ? new Date() : null,
      resolvedBy: status === 'RESOLVED' ? userId : null
    }
  });

  return alert;
}

/**
 * Get active alerts with filters
 */
async function getActiveAlerts(filters) {
  const { warehouseId, severity, type, limit = 50 } = filters;

  const where = {
    status: 'ACTIVE'
  };

  if (warehouseId) where.warehouseId = warehouseId;
  if (severity) where.severity = severity;
  if (type) where.type = type;

  return prisma.alert.findMany({
    where,
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: {
      warehouse: true,
      createdByUser: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    }
  });
}

/**
 * Create alert threshold
 */
async function createAlertThreshold(data, userId) {
  const { metricType, thresholdType, value, itemId, warehouseId, alertSeverity } = data;

  const threshold = await prisma.alertThreshold.create({
    data: {
      metricType,
      thresholdType,
      value,
      itemId,
      warehouseId,
      alertSeverity,
      isActive: true,
      createdBy: userId
    },
    include: { item: true, warehouse: true }
  });

  return threshold;
}

/**
 * Update alert threshold
 */
async function updateAlertThreshold(thresholdId, data, userId) {
  const { value, alertSeverity, isActive } = data;

  const updateData = {};
  if (value !== undefined) updateData.value = value;
  if (alertSeverity) updateData.alertSeverity = alertSeverity;
  if (isActive !== undefined) updateData.isActive = isActive;

  return prisma.alertThreshold.update({
    where: { id: thresholdId },
    data: updateData
  });
}

/**
 * Get all thresholds
 */
async function getThresholds(filters) {
  const { warehouseId, metricType } = filters;

  const where = { isActive: true };
  if (warehouseId) where.warehouseId = warehouseId;
  if (metricType) where.metricType = metricType;

  return prisma.alertThreshold.findMany({
    where,
    include: {
      item: true,
      warehouse: true,
      createdByUser: {
        select: { id: true, email: true }
      }
    }
  });
}

/**
 * Delete a threshold
 */
async function deleteThreshold(thresholdId, userId) {
  await prisma.alertThreshold.delete({
    where: { id: thresholdId }
  });

  return { success: true };
}

/**
 * Get alert statistics
 */
async function getAlertStats(warehouseId, daysBack = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const [
    totalAlerts,
    bySeverity,
    byType,
    avgResolutionTime
  ] = await Promise.all([
    prisma.alert.count({
      where: {
        createdAt: { gte: startDate },
        ...(warehouseId ? { warehouseId } : {})
      }
    }),
    prisma.alert.groupBy({
      by: ['severity'],
      _count: true,
      where: {
        createdAt: { gte: startDate },
        ...(warehouseId ? { warehouseId } : {})
      }
    }),
    prisma.alert.groupBy({
      by: ['type'],
      _count: true,
      where: {
        createdAt: { gte: startDate },
        ...(warehouseId ? { warehouseId } : {})
      }
    }),
    // Average resolution time (simplified)
    prisma.alert.aggregate({
      _avg: { resolutionTimeHours: true },
      where: {
        status: 'RESOLVED',
        resolvedAt: { gte: startDate },
        ...(warehouseId ? { warehouseId } : {})
      }
    })
  ]);

  return {
    period: { days: daysBack, startDate, endDate: new Date() },
    totalAlerts,
    bySeverity: bySeverity.reduce((acc, curr) => ({ ...acc, [curr.severity]: curr._count }), {}),
    byType: byType.reduce((acc, curr) => ({ ...acc, [curr.type]: curr._count }), {}),
    avgResolutionTimeHours: avgResolutionTime._avg.resolutionTimeHours || 0
  };
}

module.exports = {
  createAlert,
  updateAlertStatus,
  getActiveAlerts,
  createAlertThreshold,
  updateAlertThreshold,
  getThresholds,
  deleteThreshold,
  getAlertStats
};
