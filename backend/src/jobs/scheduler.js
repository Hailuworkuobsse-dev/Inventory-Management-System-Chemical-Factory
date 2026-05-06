const cron = require('node-cron');
const prisma = require('../utils/prisma');
const notificationService = require('./notification.service');
const emailSender = require('../utils/emailSender');

let ioInstance = null;

/**
 * Initialize all scheduled jobs
 * @param {Object} io - Socket.io instance for notifications
 */
const init = (io) => {
  ioInstance = io;

  // Daily expiry alert job at 08:00 (FR-013)
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily expiry alert job...');
    await runExpiryAlertJob();
  });

  // Stock-out risk check every 6 hours (FR-061)
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running stock-out risk job...');
    await runStockOutRiskJob();
  });

  // Weekly ABC analysis recalculation (FR-052)
  cron.schedule('0 2 * * 0', async () => {
    console.log('Running weekly ABC analysis job...');
    await runABCAnalysisJob();
  });

  // Monthly lead time update (FR-031)
  cron.schedule('0 3 1 * *', async () => {
    console.log('Running monthly lead time update job...');
    await runLeadTimeUpdateJob();
  });

  // Daily batch status cleanup (expired batches)
  cron.schedule('0 4 * * *', async () => {
    console.log('Running daily batch status cleanup...');
    await runBatchCleanupJob();
  });

  console.log('✓ All scheduled jobs initialized');
};

/**
 * Check for batches expiring within 30/60/90 days and send alerts (FR-013)
 */
const runExpiryAlertJob = async () => {
  try {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Find batches expiring within 90 days
    const expiringBatches = await prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: ninetyDays
        },
        status: 'RELEASED'
      },
      include: {
        product: true,
        stocks: {
          include: {
            warehouse: true
          }
        }
      }
    });

    if (expiringBatches.length === 0) {
      console.log('No batches nearing expiry');
      return;
    }

    // Format alert data
    const alertData = expiringBatches.map(batch => ({
      id: batch.id,
      batchNumber: batch.batchNumber,
      productName: batch.product.brandName || batch.product.inn,
      sku: batch.product.sku,
      expiryDate: batch.expiryDate,
      daysRemaining: Math.ceil((batch.expiryDate - now) / (1000 * 60 * 60 * 24)),
      totalQuantity: batch.stocks.reduce((sum, s) => sum + parseFloat(s.quantity), 0),
      warehouses: batch.stocks.map(s => s.warehouse.name)
    }));

    // Categorize by urgency
    const critical = alertData.filter(b => b.daysRemaining <= 30);
    const warning = alertData.filter(b => b.daysRemaining > 30 && b.daysRemaining <= 60);
    const notice = alertData.filter(b => b.daysRemaining > 60 && b.daysRemaining <= 90);

    console.log(`Expiry Alert: ${critical.length} critical, ${warning.length} warning, ${notice.length} notice`);

    // Send push notification
    if (ioInstance && critical.length > 0) {
      notificationService.notifyExpiryAlert(ioInstance, critical);
    }

    // Send email to quality manager
    const qualityManagerEmail = process.env.QUALITY_MANAGER_EMAIL;
    if (qualityManagerEmail && alertData.length > 0) {
      await emailSender.sendExpiryAlert(alertData, qualityManagerEmail);
    }

  } catch (error) {
    console.error('Expiry alert job failed:', error);
  }
};

/**
 * Check stock levels against safety stock and flag critical medicines (FR-061)
 */
const runStockOutRiskJob = async () => {
  try {
    const lowStockItems = await prisma.stock.findMany({
      where: {
        quantity: {
          lte: prisma.stock.fields.safetyStock // This requires a different approach
        }
      },
      include: {
        batch: {
          include: {
            product: true
          }
        },
        warehouse: true
      }
    });

    // Alternative query for items below safety stock
    const allStock = await prisma.stock.findMany({
      include: {
        batch: {
          include: {
            product: true
          }
        },
        warehouse: true
      }
    });

    const lowStock = allStock.filter(s => {
      const safetyStock = s.batch.product.safetyStock;
      return safetyStock && parseFloat(s.quantity) < parseFloat(safetyStock);
    });

    if (lowStock.length === 0) {
      console.log('All stock levels adequate');
      return;
    }

    const alertData = lowStock.map(s => ({
      stockId: s.id,
      productId: s.batch.productId,
      productName: s.batch.product.brandName || s.batch.product.inn,
      sku: s.batch.product.sku,
      currentStock: parseFloat(s.quantity),
      safetyStock: parseFloat(s.batch.product.safetyStock),
      warehouseName: s.warehouse.name,
      batchNumber: s.batch.batchNumber,
      expiryDate: s.batch.expiryDate
    }));

    console.log(`Stock-Out Risk: ${alertData.length} items below safety stock`);

    // Send push notification
    if (ioInstance) {
      notificationService.notifyStockOutRisk(ioInstance, alertData);
    }

    // Send email to procurement manager
    const procurementManagerEmail = process.env.PROCUREMENT_MANAGER_EMAIL;
    if (procurementManagerEmail) {
      await emailSender.sendStockOutAlert(alertData, procurementManagerEmail);
    }

  } catch (error) {
    console.error('Stock-out risk job failed:', error);
  }
};

/**
 * Recalculate ABC classification based on consumption value (FR-052)
 */
const runABCAnalysisJob = async () => {
  try {
    // Get all products with their consumption in the last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const movements = await prisma.stockLedger.findMany({
      where: {
        movementType: 'ISSUE',
        timestamp: { gte: ninetyDaysAgo }
      },
      include: {
        stock: {
          include: {
            batch: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    // Calculate consumption value per product
    const productConsumption = movements.reduce((acc, m) => {
      const sku = m.stock.batch.product.sku;
      if (!acc[sku]) {
        acc[sku] = {
          productId: m.stock.batch.productId,
          sku,
          productName: m.stock.batch.product.brandName || m.stock.batch.product.inn,
          totalQuantity: 0,
          totalValue: 0
        };
      }
      acc[sku].totalQuantity += Math.abs(parseFloat(m.quantityChange));
      acc[sku].totalValue += Math.abs(parseFloat(m.quantityChange)) * parseFloat(m.stock.costPrice);
      return acc;
    }, {});

    // Sort by value descending
    const sorted = Object.values(productConsumption).sort((a, b) => b.totalValue - a.totalValue);

    // Calculate cumulative percentage and assign ABC class
    const totalValue = sorted.reduce((sum, p) => sum + p.totalValue, 0);
    let cumulative = 0;

    for (const product of sorted) {
      cumulative += product.totalValue;
      const percentage = (cumulative / totalValue) * 100;

      if (percentage <= 80) {
        product.abcClass = 'A'; // Top 80% of value
      } else if (percentage <= 95) {
        product.abcClass = 'B'; // Next 15%
      } else {
        product.abcClass = 'C'; // Bottom 5%
      }
    }

    console.log(`ABC Analysis complete: A=${sorted.filter(p => p.abcClass === 'A').length}, B=${sorted.filter(p => p.abcClass === 'B').length}, C=${sorted.filter(p => p.abcClass === 'C').length}`);

    // Store results (could be saved to a separate table or cache)
    // For now, just log
    return sorted;

  } catch (error) {
    console.error('ABC analysis job failed:', error);
  }
};

/**
 * Compute average lead times from historical receipts (FR-031)
 */
const runLeadTimeUpdateJob = async () => {
  try {
    // Get all completed purchase orders with receipt dates
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        supplier: true,
        receipts: {
          orderBy: { receivedDate: 'asc' }
        }
      }
    });

    // Calculate lead time per supplier
    const supplierLeadTimes = {};

    for (const po of purchaseOrders) {
      if (!po.receipts.length || !po.expectedDate) continue;

      const firstReceipt = po.receipts[0];
      const leadTimeDays = Math.ceil(
        (firstReceipt.receivedDate - po.expectedDate) / (1000 * 60 * 60 * 24)
      );

      if (!supplierLeadTimes[po.supplierId]) {
        supplierLeadTimes[po.supplierId] = {
          supplierId: po.supplierId,
          supplierName: po.supplier.name,
          leadTimes: []
        };
      }
      supplierLeadTimes[po.supplierId].leadTimes.push(leadTimeDays);
    }

    // Calculate averages
    const averages = Object.values(supplierLeadTimes).map(s => ({
      supplierId: s.supplierId,
      supplierName: s.supplierName,
      averageLeadTime: s.leadTimes.reduce((a, b) => a + b, 0) / s.leadTimes.length,
      orderCount: s.leadTimes.length
    }));

    console.log('Lead time analysis complete:', averages);
    return averages;

  } catch (error) {
    console.error('Lead time update job failed:', error);
  }
};

/**
 * Mark expired batches as EXPIRED
 */
const runBatchCleanupJob = async () => {
  try {
    const now = new Date();

    const result = await prisma.batch.updateMany({
      where: {
        expiryDate: { lt: now },
        status: { not: 'EXPIRED' }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    console.log(`Marked ${result.count} batches as EXPIRED`);
    return result;

  } catch (error) {
    console.error('Batch cleanup job failed:', error);
  }
};

module.exports = {
  init,
  runExpiryAlertJob,
  runStockOutRiskJob,
  runABCAnalysisJob,
  runLeadTimeUpdateJob,
  runBatchCleanupJob
};
