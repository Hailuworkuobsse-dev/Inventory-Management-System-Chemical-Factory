const prisma = require('../../utils/prisma');
const notificationService = require('../../services/notification.service');

/**
 * Stock-Out Risk Job
 * Compares stock vs. safety stock and flags critical medicines (FR-061)
 * Runs every 6 hours
 */
class StockOutRiskJob {
  /**
   * Run the stock-out risk job
   */
  async run() {
    console.log('Checking for stock-out risks...');

    const now = new Date();
    let totalAlerts = 0;

    // Get all products with safety stock thresholds
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        alertThresholds: {
          where: {
            alertType: 'LOW_STOCK',
          },
        },
      },
    });

    // Check each product's stock levels across warehouses
    for (const product of products) {
      const safetyStock = product.alertThresholds[0]?.value || 100; // Default to 100 if not set

      // Get current stock for this product
      const stockLevels = await prisma.stock.groupBy({
        by: ['warehouseId'],
        where: {
          productId: product.id,
          quantity: { gt: 0 },
        },
        _sum: {
          quantity: true,
        },
        include: {
          warehouse: {
            select: {
              name: true,
            },
          },
        },
      });

      // Check each warehouse
      for (const stock of stockLevels) {
        const currentStock = stock._sum.quantity || 0;

        if (currentStock < safetyStock) {
          // Check if alert already exists
          const existingAlert = await prisma.alertLog.findFirst({
            where: {
              productId: product.id,
              warehouseId: stock.warehouseId,
              alertType: 'STOCK_OUT_RISK',
              acknowledged: false,
            },
          });

          if (!existingAlert) {
            await prisma.alertLog.create({
              data: {
                productId: product.id,
                warehouseId: stock.warehouseId,
                alertType: 'STOCK_OUT_RISK',
                severity: currentStock === 0 ? 'CRITICAL' : 'HIGH',
                message: `Product ${product.name} (${product.sku}) is below safety stock. Current: ${currentStock}, Safety: ${safetyStock}`,
                triggeredAt: now,
                acknowledged: false,
                metadata: {
                  currentStock,
                  safetyStock,
                  shortage: safetyStock - currentStock,
                },
              },
            });

            totalAlerts++;
          }
        }
      }
    }

    // If alerts were created, send notifications
    if (totalAlerts > 0) {
      // Get products with stock-out risk
      const atRiskProducts = await prisma.alertLog.findMany({
        where: {
          alertType: 'STOCK_OUT_RISK',
          acknowledged: false,
          triggeredAt: { gte: now },
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
          warehouse: {
            select: {
              name: true,
            },
          },
        },
      });

      const productsForNotification = atRiskProducts.map(alert => ({
        productName: alert.product.name,
        sku: alert.product.sku,
        currentStock: alert.metadata?.currentStock || 0,
        safetyStock: alert.metadata?.safetyStock || 0,
        warehouseName: alert.warehouse?.name || 'Unknown',
      }));

      await notificationService.notifyStockOutRisk(productsForNotification);
      
      console.log(`Created ${totalAlerts} stock-out risk alerts`);
    }

    console.log(`Stock-out risk job completed. Total alerts created: ${totalAlerts}`);
    return { success: true, alertsCreated: totalAlerts };
  }
}

module.exports = new StockOutRiskJob();
