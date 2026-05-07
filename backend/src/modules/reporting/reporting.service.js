const { PrismaClient } = require('@prisma/client');
const { calculateInventoryValuation } = require('../inventory/inventory.utils');

const prisma = new PrismaClient();

/**
 * Generate a report based on type
 */
async function generateReport(data, userId) {
  const { type, startDate, endDate, warehouseId, itemId, format } = data;

  let reportData;

  switch (type) {
    case 'INVENTORY_VALUATION':
      reportData = await generateInventoryValuation(warehouseId);
      break;
    case 'STOCK_MOVEMENT':
      reportData = await generateStockMovement(startDate, endDate, warehouseId, itemId);
      break;
    case 'SALES_ANALYSIS':
      reportData = await generateSalesAnalysis(startDate, endDate, warehouseId);
      break;
    case 'PURCHASE_ANALYSIS':
      reportData = await generatePurchaseAnalysis(startDate, endDate, warehouseId);
      break;
    case 'ABC_ANALYSIS':
      reportData = await generateABCAnalysis(warehouseId);
      break;
    default:
      throw new Error(`Unknown report type: ${type}`);
  }

  return {
    reportType: type,
    generatedAt: new Date(),
    generatedBy: userId,
    parameters: { startDate, endDate, warehouseId, itemId },
    format,
    data: reportData
  };
}

/**
 * Get dashboard metrics
 */
async function getDashboardMetrics(options, userId) {
  const { warehouseId, includeTrends, daysBack } = options;

  const [
    totalItems,
    totalBatches,
    lowStockItems,
    expiringSoon,
    pendingOrders,
    recentMovements
  ] = await Promise.all([
    prisma.item.count(),
    prisma.batch.count({ where: { status: 'ACTIVE' } }),
    getLowStockItems(warehouseId),
    getExpiringBatches(warehouseId),
    prisma.purchaseOrder.count({ where: { status: { in: ['PENDING', 'APPROVED'] } } }),
    prisma.stockMovement.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
        }
      },
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: { item: true, batch: true }
    })
  ]);

  return {
    summary: {
      totalItems,
      activeBatches: totalBatches,
      lowStockCount: lowStockItems.length,
      expiringSoonCount: expiringSoon.length,
      pendingPOs: pendingOrders
    },
    alerts: {
      lowStock: lowStockItems,
      expiringSoon: expiringSoon.slice(0, 10)
    },
    recentActivity: recentMovements,
    generatedAt: new Date()
  };
}

/**
 * Generate inventory valuation report
 */
async function generateInventoryValuation(warehouseId) {
  const where = { quantity: { gt: 0 } };
  if (warehouseId) where.warehouseId = warehouseId;

  const stockLevels = await prisma.stockLevel.findMany({
    where,
    include: {
      item: true,
      warehouse: true,
      batch: true
    }
  });

  return calculateInventoryValuation(stockLevels);
}

/**
 * Generate stock movement report
 */
async function generateStockMovement(startDate, endDate, warehouseId, itemId) {
  const where = {
    timestamp: {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  };

  if (warehouseId) where.warehouseId = warehouseId;
  if (itemId) where.itemId = itemId;

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      item: true,
      batch: true,
      reference: true
    },
    orderBy: { timestamp: 'asc' }
  });

  const summary = {
    totalMovements: movements.length,
    receipts: movements.filter(m => m.type === 'RECEIPT').length,
    shipments: movements.filter(m => m.type === 'SHIPMENT').length,
    adjustments: movements.filter(m => m.type === 'ADJUSTMENT').length,
    transfers: movements.filter(m => m.type === 'TRANSFER').length
  };

  return { summary, movements };
}

/**
 * Generate sales analysis report
 */
async function generateSalesAnalysis(startDate, endDate, warehouseId) {
  const where = {
    createdAt: {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  };

  if (warehouseId) where.warehouseId = warehouseId;

  const orders = await prisma.salesOrder.findMany({
    where,
    include: {
      items: { include: { item: true } },
      customer: true
    }
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Top selling items
  const itemSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemSales[item.itemId]) {
        itemSales[item.itemId] = { 
          itemId: item.itemId, 
          name: item.item?.name, 
          quantity: 0, 
          revenue: 0 
        };
      }
      itemSales[item.itemId].quantity += item.quantity;
    });
  });

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue
    },
    topSellingItems: topItems,
    orders
  };
}

/**
 * Generate purchase analysis report
 */
async function generatePurchaseAnalysis(startDate, endDate, warehouseId) {
  const where = {
    createdAt: {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  };

  if (warehouseId) where.warehouseId = warehouseId;

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where,
    include: {
      supplier: true,
      items: { include: { item: true } }
    }
  });

  const totalSpend = purchaseOrders.reduce((sum, po) => sum + (po.totalValue || 0), 0);
  const totalPOs = purchaseOrders.length;

  // Spend by supplier
  const supplierSpend = {};
  purchaseOrders.forEach(po => {
    if (!supplierSpend[po.supplierId]) {
      supplierSpend[po.supplierId] = {
        supplierId: po.supplierId,
        name: po.supplier?.name,
        totalSpend: 0,
        orderCount: 0
      };
    }
    supplierSpend[po.supplierId].totalSpend += po.totalValue || 0;
    supplierSpend[po.supplierId].orderCount++;
  });

  return {
    summary: {
      totalSpend,
      totalPOs,
      avgPOValue: totalPOs > 0 ? totalSpend / totalPOs : 0
    },
    bySupplier: Object.values(supplierSpend).sort((a, b) => b.totalSpend - a.totalSpend),
    purchaseOrders
  };
}

/**
 * Generate ABC Analysis report
 */
async function generateABCAnalysis(warehouseId) {
  const where = { quantity: { gt: 0 } };
  if (warehouseId) where.warehouseId = warehouseId;

  const stockLevels = await prisma.stockLevel.findMany({
    where,
    include: { item: true }
  });

  // Calculate annual consumption value for each item
  const itemValues = stockLevels.map(stock => ({
    itemId: stock.itemId,
    name: stock.item?.name,
    quantity: stock.quantity,
    unitCost: stock.avgCost || 0,
    totalValue: stock.quantity * (stock.avgCost || 0)
  }));

  // Sort by value descending
  itemValues.sort((a, b) => b.totalValue - a.totalValue);

  const totalValue = itemValues.reduce((sum, item) => sum + item.totalValue, 0);
  let cumulativeValue = 0;

  // Classify into A, B, C categories
  const classified = itemValues.map(item => {
    cumulativeValue += item.totalValue;
    const cumulativePercent = (cumulativeValue / totalValue) * 100;

    let category;
    if (cumulativePercent <= 80) category = 'A'; // Top 80% of value
    else if (cumulativePercent <= 95) category = 'B'; // Next 15%
    else category = 'C'; // Bottom 5%

    return { ...item, category, cumulativePercent };
  });

  // Summary
  const summary = {
    A: classified.filter(i => i.category === 'A'),
    B: classified.filter(i => i.category === 'B'),
    C: classified.filter(i => i.category === 'C')
  };

  return {
    totalValue,
    itemCount: itemValues.length,
    classification: classified,
    summary: {
      A: { count: summary.A.length, value: summary.A.reduce((s, i) => s + i.totalValue, 0) },
      B: { count: summary.B.length, value: summary.B.reduce((s, i) => s + i.totalValue, 0) },
      C: { count: summary.C.length, value: summary.C.reduce((s, i) => s + i.totalValue, 0) }
    }
  };
}

/**
 * Helper: Get low stock items
 */
async function getLowStockItems(warehouseId) {
  const where = { quantity: { lte: 10 } }; // Threshold could be configurable
  if (warehouseId) where.warehouseId = warehouseId;

  return prisma.stockLevel.findMany({
    where,
    include: { item: true, warehouse: true }
  });
}

/**
 * Helper: Get expiring batches
 */
async function getExpiringBatches(warehouseId) {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const where = {
    expiresAt: {
      lte: thirtyDaysFromNow
    },
    status: 'ACTIVE'
  };

  return prisma.batch.findMany({
    where,
    include: { item: true },
    orderBy: { expiresAt: 'asc' }
  });
}

module.exports = {
  generateReport,
  getDashboardMetrics,
  generateInventoryValuation,
  generateStockMovement,
  generateSalesAnalysis,
  generatePurchaseAnalysis,
  generateABCAnalysis
};
