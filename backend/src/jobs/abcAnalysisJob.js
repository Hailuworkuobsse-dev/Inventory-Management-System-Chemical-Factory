const prisma = require('../utils/prisma');

/**
 * Recalculate ABC classification based on consumption value (FR-052)
 * This job runs weekly on Sunday at 02:00
 * 
 * ABC Analysis:
 * - Class A: Top 80% of total consumption value
 * - Class B: Next 15% of total consumption value
 * - Class C: Bottom 5% of total consumption value
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

    if (movements.length === 0) {
      console.log('No stock movements found for ABC analysis');
      return { success: true, message: 'No stock movements found', data: [] };
    }

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

    const counts = {
      A: sorted.filter(p => p.abcClass === 'A').length,
      B: sorted.filter(p => p.abcClass === 'B').length,
      C: sorted.filter(p => p.abcClass === 'C').length
    };

    console.log(`ABC Analysis complete: A=${counts.A}, B=${counts.B}, C=${counts.C}`);

    // Update products with their ABC classification
    const updatePromises = sorted.map(product => 
      prisma.product.update({
        where: { id: product.productId },
        data: { abcClass: product.abcClass }
      }).catch(err => {
        console.error(`Failed to update product ${product.productId}:`, err.message);
      })
    );

    await Promise.all(updatePromises);

    return {
      success: true,
      message: 'ABC analysis completed and updated',
      counts,
      totalValue,
      data: sorted
    };

  } catch (error) {
    console.error('ABC analysis job failed:', error);
    throw error;
  }
};

module.exports = {
  runABCAnalysisJob
};
