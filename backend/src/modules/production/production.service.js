const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../utils/customErrors');
const auditService = require('../../services/audit.service');

const prisma = new PrismaClient();

/**
 * Create a Bill of Materials (BOM)
 */
async function createBOM(data, userId) {
  const { productId, name, version, items } = data;

  return prisma.$transaction(async (tx) => {
    const bom = await tx.bOM.create({
      data: {
        productId,
        name,
        version,
        isActive: true,
        createdBy: userId,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitOfMeasure: item.unitOfMeasure
          }))
        }
      },
      include: { items: true, product: true }
    });

    await auditService.logAction(tx, {
      userId,
      action: 'BOM_CREATED',
      entityType: 'BOM',
      entityId: bom.id,
      details: { name, version }
    });

    return bom;
  });
}

/**
 * Create a work order
 */
async function createWorkOrder(data, userId) {
  const { bomId, productionLineId, plannedQuantity, scheduledStartDate, scheduledEndDate, priority } = data;

  const workOrder = await prisma.workOrder.create({
    data: {
      bomId,
      productionLineId,
      plannedQuantity,
      scheduledStartDate,
      scheduledEndDate,
      priority,
      status: 'PLANNED',
      createdBy: userId
    },
    include: { bom: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'WORK_ORDER_CREATED',
    entityType: 'WorkOrder',
    entityId: workOrder.id,
    details: { plannedQuantity }
  });

  return workOrder;
}

/**
 * Update work order status
 */
async function updateWorkOrderStatus(workOrderId, status, userId) {
  const workOrder = await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status },
    include: { bom: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'WORK_ORDER_STATUS_UPDATED',
    entityType: 'WorkOrder',
    entityId: workOrderId,
    details: { status }
  });

  return workOrder;
}

/**
 * Record production output (goods produced and waste)
 */
async function recordProductionOutput(data, userId) {
  const { workOrderId, goodQuantity, wasteQuantity, batchNumber, notes } = data;

  return prisma.$transaction(async (tx) => {
    const workOrder = await tx.workOrder.findUnique({
      where: { id: workOrderId },
      include: { bom: true }
    });

    if (!workOrder) throw new AppError('Work order not found', 404);

    // Calculate yield
    const yieldPercent = (goodQuantity / workOrder.plannedQuantity) * 100;

    // Create production batch
    const batch = await tx.batch.create({
      data: {
        itemId: workOrder.bom.productId,
        quantity: goodQuantity,
        batchNumber: batchNumber || `PROD-${Date.now()}`,
        manufacturingDate: new Date(),
        status: 'ACTIVE',
        productionType: 'MANUFACTURED'
      }
    });

    // Record the production run
    const productionRun = await tx.productionRun.create({
      data: {
        workOrderId,
        batchId: batch.id,
        goodQuantity,
        wasteQuantity,
        yieldPercent,
        notes,
        recordedBy: userId
      }
    });

    // Update work order
    await tx.workOrder.update({
      where: { id: workOrderId },
      data: { 
        status: 'COMPLETED',
        actualQuantity: goodQuantity,
        completedAt: new Date()
      }
    });

    // Consume raw materials from inventory (simplified - would need BOM explosion)
    // This would deduct components based on BOM * goodQuantity

    await auditService.logAction(tx, {
      userId,
      action: 'PRODUCTION_OUTPUT_RECORDED',
      entityType: 'ProductionRun',
      entityId: productionRun.id,
      details: { goodQuantity, wasteQuantity, yieldPercent }
    });

    return productionRun;
  });
}

/**
 * Get production analytics
 */
async function getProductionAnalytics(productionLineId, startDate, endDate) {
  const where = {};
  if (productionLineId) where.productionLineId = productionLineId;
  if (startDate || endDate) {
    where.completedAt = {};
    if (startDate) where.completedAt.gte = new Date(startDate);
    if (endDate) where.completedAt.lte = new Date(endDate);
  }

  const runs = await prisma.productionRun.findMany({
    where,
    include: { workOrder: { include: { bom: true } } }
  });

  const totalGood = runs.reduce((sum, r) => sum + r.goodQuantity, 0);
  const totalWaste = runs.reduce((sum, r) => sum + r.wasteQuantity, 0);
  const avgYield = runs.length > 0 
    ? runs.reduce((sum, r) => sum + r.yieldPercent, 0) / runs.length 
    : 0;

  return {
    totalRuns: runs.length,
    totalGoodQuantity: totalGood,
    totalWasteQuantity: totalWaste,
    averageYieldPercent: avgYield,
    runs
  };
}

module.exports = {
  createBOM,
  createWorkOrder,
  updateWorkOrderStatus,
  recordProductionOutput,
  getProductionAnalytics
};
