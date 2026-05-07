const prisma = require('../../utils/prisma');

/**
 * ABC Analysis Job
 * Recalculates ABC classification based on consumption value (FR-052)
 * Runs weekly on Monday at 02:00
 */
class ABCAnalysisJob {
  /**
   * Run the ABC analysis job
   */
  async run() {
    console.log('Running ABC analysis...');

    const now = new Date();
    
    // Calculate date range for last 90 days of consumption
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        stock: {
          where: { quantity: { gt: 0 } },
          select: {
            quantity: true,
            unitCostETB: true,
          },
        },
      },
    });

    // Calculate consumption value for each product (based on stock movements)
    const productValues = [];

    for (const product of products) {
      // Get total consumption from stock ledger in last 90 days
      const movements = await prisma.stockLedger.findMany({
        where: {
          productId: product.id,
          movementType: 'OUT',
          timestamp: { gte: ninetyDaysAgo },
        },
        select: {
          quantity: true,
          unitCostETB: true,
        },
      });

      // Calculate total consumption value
      const totalConsumptionValue = movements.reduce(
        (sum, m) => sum + (m.quantity * m.unitCostETB),
        0
      );

      // If no outbound movements, use current stock value as proxy
      const currentValue = totalConsumptionValue > 0 
        ? totalConsumptionValue
        : product.stock.reduce((sum, s) => sum + (s.quantity * s.unitCostETB), 0);

      productValues.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        consumptionValue: currentValue,
      });
    }

    // Sort by consumption value (descending)
    productValues.sort((a, b) => b.consumptionValue - a.consumptionValue);

    // Calculate total value
    const totalValue = productValues.reduce((sum, p) => sum + p.consumptionValue, 0);

    // Classify into A, B, C categories
    // A: Top 80% of value
    // B: Next 15% of value
    // C: Remaining 5% of value
    let cumulativeValue = 0;
    const classifications = { A: [], B: [], C: [] };

    for (const product of productValues) {
      cumulativeValue += product.consumptionValue;
      const cumulativePercent = (cumulativeValue / totalValue) * 100;

      if (cumulativePercent <= 80) {
        classifications.A.push(product.productId);
      } else if (cumulativePercent <= 95) {
        classifications.B.push(product.productId);
      } else {
        classifications.C.push(product.productId);
      }
    }

    // Update product classifications in database
    let updateCount = 0;

    for (const productId of classifications.A) {
      await prisma.product.update({
        where: { id: productId },
        data: { abcClassification: 'A' },
      });
      updateCount++;
    }

    for (const productId of classifications.B) {
      await prisma.product.update({
        where: { id: productId },
        data: { abcClassification: 'B' },
      });
      updateCount++;
    }

    for (const productId of classifications.C) {
      await prisma.product.update({
        where: { id: productId },
        data: { abcClassification: 'C' },
      });
      updateCount++;
    }

    console.log(`ABC analysis completed. Updated ${updateCount} products:`);
    console.log(`  Category A: ${classifications.A.length} products`);
    console.log(`  Category B: ${classifications.B.length} products`);
    console.log(`  Category C: ${classifications.C.length} products`);

    return {
      success: true,
      updated: updateCount,
      summary: {
        A: classifications.A.length,
        B: classifications.B.length,
        C: classifications.C.length,
      },
    };
  }
}

module.exports = new ABCAnalysisJob();
