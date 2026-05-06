const prisma = require('../utils/prisma');
const notificationService = require('../services/notification.service');
const emailSender = require('../utils/emailSender');

let ioInstance = null;

/**
 * Check stock levels against safety stock and flag critical medicines (FR-061)
 * This job runs every 6 hours
 */
const runStockOutRiskJob = async (io) => {
  if (io) {
    ioInstance = io;
  }

  try {
    // Get all stock with batch and product information
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

    // Filter items below safety stock
    const lowStock = allStock.filter(s => {
      const safetyStock = s.batch.product.safetyStock;
      return safetyStock && parseFloat(s.quantity) < parseFloat(safetyStock);
    });

    if (lowStock.length === 0) {
      console.log('All stock levels adequate');
      return { success: true, message: 'All stock levels adequate', count: 0 };
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
      expiryDate: s.batch.expiryDate,
      shortageAmount: parseFloat(s.batch.product.safetyStock) - parseFloat(s.quantity)
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

    return {
      success: true,
      message: 'Stock-out risk alerts processed',
      count: alertData.length,
      data: alertData
    };

  } catch (error) {
    console.error('Stock-out risk job failed:', error);
    throw error;
  }
};

module.exports = {
  runStockOutRiskJob
};
