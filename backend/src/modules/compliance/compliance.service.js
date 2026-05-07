const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../utils/customErrors');
const erisService = require('../../services/integration/eris.service');

const prisma = new PrismaClient();

/**
 * Generate eRIS export for tax authority
 */
async function generateErisExport(data, userId) {
  const { startDate, endDate, warehouseId, format } = data;

  // Fetch all transactions in date range
  const transactions = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Use eRIS service to format and export
  const exportData = await erisService.generateExport({
    transactions,
    warehouseId,
    startDate,
    endDate,
    format
  });

  return {
    filename: `eRIS_${startDate}_${endDate}.${format.toLowerCase()}`,
    data: exportData,
    recordCount: transactions.length
  };
}

/**
 * Generate EUDR compliance report
 */
async function generateEUDRReport(data, userId) {
  const { productId, batchId, includeGeolocation } = data;

  const where = {};
  if (productId) where.productId = productId;
  if (batchId) where.batchId = batchId;

  const complianceRecords = await prisma.eUDRCompliance.findMany({
    where,
    include: {
      batch: {
        include: {
          item: true,
          stockLevels: true
        }
      },
      product: true
    }
  });

  // Format for EUDR submission
  const report = complianceRecords.map(record => ({
    productId: record.productId,
    batchId: record.batchId,
    geolocation: includeGeolocation ? record.geolocation : undefined,
    harvestDate: record.harvestDate,
    supplierDeclaration: record.supplierDeclaration,
    verificationStatus: record.status,
    verifiedBy: record.verifiedBy,
    verifiedAt: record.verifiedAt
  }));

  return {
    generatedAt: new Date(),
    recordCount: report.length,
    data: report
  };
}

/**
 * Get audit logs with filters
 */
async function getAuditLogs(filters) {
  const { entityType, entityId, userId, action, startDate, endDate, limit } = filters;

  const where = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (userId) where.userId = userId;
  if (action) where.action = action;
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return logs;
}

/**
 * Get compliance summary dashboard
 */
async function getComplianceDashboard() {
  const [
    totalBatches,
    compliantBatches,
    pendingVerification,
    recalls
  ] = await Promise.all([
    prisma.batch.count(),
    prisma.eUDRCompliance.count({ where: { status: 'COMPLIANT' } }),
    prisma.eUDRCompliance.count({ where: { status: 'PENDING' } }),
    prisma.productRecall.count({ where: { status: 'ACTIVE' } })
  ]);

  return {
    totalBatches,
    complianceRate: totalBatches > 0 ? (compliantBatches / totalBatches) * 100 : 0,
    pendingVerification,
    activeRecalls: recalls,
    lastUpdated: new Date()
  };
}

module.exports = {
  generateErisExport,
  generateEUDRReport,
  getAuditLogs,
  getComplianceDashboard
};
