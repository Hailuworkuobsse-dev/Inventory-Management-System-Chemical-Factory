const prisma = require('../utils/prisma');
const notificationService = require('../services/notification.service');
const emailSender = require('../utils/emailSender');

let ioInstance = null;

/**
 * Check for batches expiring within 30/60/90 days and send alerts (FR-013)
 * This job runs daily at 08:00
 */
const runExpiryAlertJob = async (io) => {
  if (io) {
    ioInstance = io;
  }

  try {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Find batches expiring within 90 days
    const expiringBatches = await prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: ninetyDays,
          gte: now
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
      return { success: true, message: 'No batches nearing expiry', count: 0 };
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

    return {
      success: true,
      message: 'Expiry alerts processed',
      counts: {
        critical: critical.length,
        warning: warning.length,
        notice: notice.length,
        total: alertData.length
      }
    };

  } catch (error) {
    console.error('Expiry alert job failed:', error);
    throw error;
  }
};

module.exports = {
  runExpiryAlertJob
};
