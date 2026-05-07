const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../utils/customErrors');
const auditService = require('../../services/audit.service');

const prisma = new PrismaClient();

/**
 * Create a supplier
 */
async function createSupplier(data, userId) {
  const supplier = await prisma.supplier.create({
    data,
    include: { contacts: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'SUPPLIER_CREATED',
    entityType: 'Supplier',
    entityId: supplier.id,
    details: { name: supplier.name }
  });

  return supplier;
}

/**
 * Create a purchase order
 */
async function createPurchaseOrder(data, userId) {
  const { supplierId, warehouseId, items, expectedDeliveryDate, notes } = data;

  return prisma.$transaction(async (tx) => {
    // Calculate total value
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const po = await tx.purchaseOrder.create({
      data: {
        supplierId,
        warehouseId,
        status: 'PENDING',
        totalValue,
        currency: items[0]?.currency || 'USD',
        expectedDeliveryDate,
        notes,
        createdBy: userId,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            currency: item.currency || 'USD'
          }))
        }
      },
      include: { items: true, supplier: true }
    });

    await auditService.logAction(tx, {
      userId,
      action: 'PURCHASE_ORDER_CREATED',
      entityType: 'PurchaseOrder',
      entityId: po.id,
      details: { poNumber: po.poNumber, totalValue }
    });

    return po;
  });
}

/**
 * Update PO status
 */
async function updatePOStatus(poId, status, userId) {
  const po = await prisma.purchaseOrder.update({
    where: { id: poId },
    data: { status },
    include: { items: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'PURCHASE_ORDER_STATUS_UPDATED',
    entityType: 'PurchaseOrder',
    entityId: poId,
    details: { status }
  });

  return po;
}

/**
 * Record forex allocation for a PO
 */
async function recordForexAllocation(data, userId) {
  const { poId, amount, currency, exchangeRate, allocationDate } = data;

  const allocation = await prisma.forexAllocation.create({
    data: {
      poId,
      amount,
      currency,
      exchangeRate,
      allocatedAmount: amount * exchangeRate, // Local currency equivalent
      allocationDate: allocationDate || new Date(),
      recordedBy: userId
    },
    include: { purchaseOrder: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'FOREX_ALLOCATION_RECORDED',
    entityType: 'ForexAllocation',
    entityId: allocation.id,
    details: { amount, currency, exchangeRate }
  });

  return allocation;
}

/**
 * Get current forex rates (mock implementation - would integrate with API)
 */
async function getForexRates(baseCurrency, targetCurrency) {
  // In production, this would call a forex API like OpenExchangeRates
  // For now, return mock rates
  const mockRates = {
    USD: { EUR: 0.85, GBP: 0.73, KES: 110.5, TZS: 2350, UGX: 3650 },
    EUR: { USD: 1.18, GBP: 0.86, KES: 130, TZS: 2765, UGX: 4295 }
  };

  if (baseCurrency === targetCurrency) {
    return { rate: 1, base: baseCurrency, target: targetCurrency };
  }

  const rate = mockRates[baseCurrency]?.[targetCurrency];
  
  if (!rate) {
    throw new AppError(`Exchange rate not available for ${baseCurrency} to ${targetCurrency}`, 400);
  }

  return { rate, base: baseCurrency, target: targetCurrency, timestamp: new Date() };
}

module.exports = {
  createSupplier,
  createPurchaseOrder,
  updatePOStatus,
  recordForexAllocation,
  getForexRates
};
