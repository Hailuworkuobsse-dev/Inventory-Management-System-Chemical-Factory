const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../utils/customErrors');
const auditService = require('../../services/audit.service');

const prisma = new PrismaClient();

/**
 * Update batch status (e.g., quarantine, reject)
 */
async function updateBatchStatus(batchId, status, reason, userId) {
  const batch = await prisma.batch.update({
    where: { id: batchId },
    data: { 
      status,
      qualityNotes: reason ? `${status}: ${reason}` : undefined
    },
    include: { item: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'BATCH_STATUS_UPDATED',
    entityType: 'Batch',
    entityId: batchId,
    details: { status, reason }
  });

  return batch;
}

/**
 * Create a lab test record
 */
async function createLabTest(data, userId) {
  const { batchId, testType, parameters, result, notes } = data;

  const labTest = await prisma.labTest.create({
    data: {
      batchId,
      testType,
      parameters,
      result,
      notes,
      testedBy: userId
    },
    include: { batch: true }
  });

  // Auto-update batch if failed
  if (result === 'FAIL') {
    await prisma.batch.update({
      where: { id: batchId },
      data: { status: 'QUARANTINE' }
    });
  }

  await auditService.logAction(prisma, {
    userId,
    action: 'LAB_TEST_CREATED',
    entityType: 'LabTest',
    entityId: labTest.id,
    details: { testType, result }
  });

  return labTest;
}

/**
 * Quarantine a batch
 */
async function quarantineBatch(batchId, reason, userId) {
  return updateBatchStatus(batchId, 'QUARANTINE', reason, userId);
}

/**
 * Initiate a product recall
 */
async function initiateRecall(data, userId) {
  const { batchId, reason, severity, affectedRegions } = data;

  return prisma.$transaction(async (tx) => {
    // Update batch status
    await tx.batch.update({
      where: { id: batchId },
      data: { status: 'RECALLED' }
    });

    // Create recall record
    const recall = await tx.productRecall.create({
      data: {
        batchId,
        reason,
        severity,
        affectedRegions,
        status: 'ACTIVE',
        initiatedBy: userId
      }
    });

    await auditService.logAction(tx, {
      userId,
      action: 'PRODUCT_RECALL_INITIATED',
      entityType: 'ProductRecall',
      entityId: recall.id,
      details: { severity, reason }
    });

    return recall;
  });
}

/**
 * Create EUDR compliance record
 */
async function createEUDRCompliance(data, userId) {
  const { productId, batchId, geolocation, harvestDate, supplierDeclaration } = data;

  const compliance = await prisma.eUDRCompliance.create({
    data: {
      productId,
      batchId,
      geolocation,
      harvestDate,
      supplierDeclaration,
      status: 'COMPLIANT',
      verifiedBy: userId
    },
    include: { batch: true, product: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'EUDR_COMPLIANCE_CREATED',
    entityType: 'EUDRCompliance',
    entityId: compliance.id
  });

  return compliance;
}

/**
 * Get batches requiring quality attention
 */
async function getQualityAlerts(warehouseId) {
  const where = {
    status: { in: ['QUARANTINE', 'PENDING_INSPECTION'] }
  };

  if (warehouseId) {
    where.stockLevels = {
      some: { warehouseId }
    };
  }

  return prisma.batch.findMany({
    where,
    include: {
      item: true,
      labTests: { orderBy: { createdAt: 'desc' }, take: 1 },
      stockLevels: true
    }
  });
}

module.exports = {
  updateBatchStatus,
  createLabTest,
  quarantineBatch,
  initiateRecall,
  createEUDRCompliance,
  getQualityAlerts
};
