const prisma = require('../../utils/prisma');
const notificationService = require('../../services/notification.service');

/**
 * Expiry Alert Job
 * Checks batches expiring in 30/60/90 days and creates alerts (FR-013)
 * Runs daily at 08:00
 */
class ExpiryAlertJob {
  /**
   * Run the expiry alert job
   */
  async run() {
    console.log('Checking for expiring batches...');
    
    const now = new Date();
    const thresholds = [30, 60, 90];
    let totalAlerts = 0;

    for (const days of thresholds) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + days);

      // Find batches expiring within this threshold
      const expiringBatches = await prisma.batch.findMany({
        where: {
          expiryDate: {
            gte: now,
            lte: futureDate,
          },
          status: 'RELEASED', // Only check released batches
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
          stock: {
            include: {
              warehouse: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (expiringBatches.length > 0) {
        // Create alerts for each batch
        for (const batch of expiringBatches) {
          const existingAlert = await prisma.alertLog.findFirst({
            where: {
              batchId: batch.id,
              alertType: 'EXPIRY_WARNING',
              acknowledged: false,
            },
          });

          if (!existingAlert) {
            await prisma.alertLog.create({
              data: {
                batchId: batch.id,
                productId: batch.productId,
                alertType: 'EXPIRY_WARNING',
                severity: days <= 30 ? 'HIGH' : days <= 60 ? 'MEDIUM' : 'LOW',
                message: `Batch ${batch.batchNumber} expires in ${days} days (${batch.expiryDate.toISOString().split('T')[0]})`,
                triggeredAt: now,
                acknowledged: false,
              },
            });

            totalAlerts++;
          }
        }

        // Prepare data for notification
        const batchesForNotification = expiringBatches.map(batch => ({
          batchNumber: batch.batchNumber,
          productName: batch.product.name,
          expiryDate: batch.expiryDate.toISOString().split('T')[0],
          quantity: batch.stock.reduce((sum, s) => sum + s.quantity, 0),
          warehouseName: batch.stock[0]?.warehouse?.name || 'Unknown',
        }));

        // Send notifications
        await notificationService.notifyExpiryAlert(batchesForNotification, days);
        
        console.log(`Created ${expiringBatches.length} expiry alerts for ${days}-day threshold`);
      }
    }

    console.log(`Expiry alert job completed. Total alerts created: ${totalAlerts}`);
    return { success: true, alertsCreated: totalAlerts };
  }
}

module.exports = new ExpiryAlertJob();
