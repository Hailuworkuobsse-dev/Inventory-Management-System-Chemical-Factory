const prisma = require('../../utils/prisma');

/**
 * Lead Time Update Job
 * Computes average lead times from historical receipts (FR-031)
 * Runs monthly on 1st at 03:00
 */
class LeadTimeUpdateJob {
  /**
   * Run the lead time update job
   */
  async run() {
    console.log('Updating supplier lead times...');

    const now = new Date();
    
    // Get all active suppliers
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
    });

    for (const supplier of suppliers) {
      // Get completed purchase orders for this supplier in last 6 months
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const completedPOs = await prisma.purchaseOrder.findMany({
        where: {
          supplierId: supplier.id,
          status: 'COMPLETED',
          expectedDate: { gte: sixMonthsAgo },
          receivedDate: { not: null },
        },
        select: {
          expectedDate: true,
          receivedDate: true,
        },
      });

      if (completedPOs.length > 0) {
        // Calculate lead times (difference between expected and actual receipt)
        const leadTimes = completedPOs.map(po => {
          const diffTime = Math.abs(po.receivedDate - po.expectedDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays;
        });

        // Calculate average lead time
        const avgLeadTime = leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;
        
        // Calculate standard deviation
        const variance = leadTimes.reduce((sum, lt) => sum + Math.pow(lt - avgLeadTime, 2), 0) / leadTimes.length;
        const stdDev = Math.sqrt(variance);

        // Update supplier with calculated lead time
        await prisma.supplier.update({
          where: { id: supplier.id },
          data: {
            avgLeadTimeDays: Math.round(avgLeadTime * 10) / 10, // Round to 1 decimal
            leadTimeStdDev: Math.round(stdDev * 10) / 10,
            lastLeadTimeCalculation: now,
          },
        });

        console.log(`Updated ${supplier.name}: Avg lead time = ${avgLeadTime.toFixed(1)} days (${completedPOs.length} orders)`);
      }
    }

    // Also update product-level lead times based on procurement history
    await this.updateProductLeadTimes();

    console.log('Lead time update job completed');
    return { success: true };
  }

  /**
   * Update product-level lead times
   */
  async updateProductLeadTimes() {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get all products that have been procured
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        purchaseOrderItems: {
          where: {
            purchaseOrder: {
              status: 'COMPLETED',
              expectedDate: { gte: sixMonthsAgo },
              receivedDate: { not: null },
            },
          },
          include: {
            purchaseOrder: {
              select: {
                expectedDate: true,
                receivedDate: true,
              },
            },
          },
        },
      },
    });

    for (const product of products) {
      if (product.purchaseOrderItems.length > 0) {
        const leadTimes = product.purchaseOrderItems.map(poi => {
          const diffTime = Math.abs(poi.purchaseOrder.receivedDate - poi.purchaseOrder.expectedDate);
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        });

        const avgLeadTime = leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            avgProcurementLeadTime: Math.round(avgLeadTime * 10) / 10,
          },
        });
      }
    }

    console.log(`Updated lead times for ${products.length} products`);
  }
}

module.exports = new LeadTimeUpdateJob();
