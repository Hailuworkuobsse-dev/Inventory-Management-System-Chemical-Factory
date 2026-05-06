const prisma = require('../utils/prisma');

/**
 * Compute average lead times from historical receipts (FR-031)
 * This job runs monthly on the 1st day at 03:00
 * 
 * Lead time is calculated as the difference between expected delivery date
 * and actual receipt date for completed purchase orders.
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

    if (purchaseOrders.length === 0) {
      console.log('No completed purchase orders found for lead time analysis');
      return { success: true, message: 'No completed purchase orders found', data: [] };
    }

    // Calculate lead time per supplier
    const supplierLeadTimes = {};

    for (const po of purchaseOrders) {
      if (!po.receipts.length || !po.expectedDate) continue;

      const firstReceipt = po.receipts[0];
      const leadTimeDays = Math.ceil(
        (firstReceipt.receivedDate - new Date(po.orderDate)) / (1000 * 60 * 60 * 24)
      );

      if (!supplierLeadTimes[po.supplierId]) {
        supplierLeadTimes[po.supplierId] = {
          supplierId: po.supplierId,
          supplierName: po.supplier.name,
          leadTimes: [],
          orderCount: 0
        };
      }
      
      if (leadTimeDays >= 0) {
        supplierLeadTimes[po.supplierId].leadTimes.push(leadTimeDays);
        supplierLeadTimes[po.supplierId].orderCount += 1;
      }
    }

    // Calculate averages
    const averages = Object.values(supplierLeadTimes)
      .filter(s => s.leadTimes.length > 0)
      .map(s => ({
        supplierId: s.supplierId,
        supplierName: s.supplierName,
        averageLeadTime: parseFloat((s.leadTimes.reduce((a, b) => a + b, 0) / s.leadTimes.length).toFixed(2)),
        minLeadTime: Math.min(...s.leadTimes),
        maxLeadTime: Math.max(...s.leadTimes),
        orderCount: s.leadTimes.length
      }));

    // Update suppliers with their average lead times
    const updatePromises = averages.map(avg =>
      prisma.supplier.update({
        where: { id: avg.supplierId },
        data: { 
          averageLeadTime: avg.averageLeadTime,
          lastLeadTimeCalculation: new Date()
        }
      }).catch(err => {
        console.error(`Failed to update supplier ${avg.supplierId}:`, err.message);
      })
    );

    await Promise.all(updatePromises);

    console.log('Lead time analysis complete:', averages);
    
    return {
      success: true,
      message: 'Lead time analysis completed and updated',
      count: averages.length,
      data: averages
    };

  } catch (error) {
    console.error('Lead time update job failed:', error);
    throw error;
  }
};

module.exports = {
  runLeadTimeUpdateJob
};
