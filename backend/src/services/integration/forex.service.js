const axios = require('axios');
const config = require('../../config');
const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');

/**
 * Fetch current forex rates from National Bank of Ethiopia (NBE) or manual source
 * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
 * @returns {Promise<Object>} Forex rate data
 */
const fetchForexRate = async (currency = 'USD') => {
  try {
    // If NBE API is available, fetch from there
    if (config.NBE_API_URL) {
      const response = await axios.get(`${config.NBE_API_URL}/rates/${currency}`);
      return {
        currency,
        rateToETB: parseFloat(response.data.rate),
        source: 'NBE',
        effectiveDate: new Date()
      };
    }

    // Fallback: Get manually entered latest rate from database
    const latestRate = await prisma.forexRate.findFirst({
      where: { currency },
      orderBy: { effectiveDate: 'desc' }
    });

    if (latestRate) {
      return latestRate;
    }

    throw new AppError(`No forex rate found for ${currency}`, 404, 'FOREX_RATE_NOT_FOUND');
  } catch (error) {
    console.error('Failed to fetch forex rate:', error.message);
    throw error;
  }
};

/**
 * Update forex rates in the database
 * @param {Array} rates - Array of rate objects { currency, rateToETB, source }
 * @returns {Promise<Array>} Created forex rate records
 */
const updateForexRates = async (rates) => {
  try {
    const created = [];

    for (const rate of rates) {
      const newRate = await prisma.forexRate.create({
        data: {
          currency: rate.currency,
          rateToETB: rate.rateToETB,
          source: rate.source || 'MANUAL',
          effectiveDate: rate.effectiveDate ? new Date(rate.effectiveDate) : new Date()
        }
      });
      created.push(newRate);
    }

    console.log(`Updated ${created.length} forex rates`);
    return created;
  } catch (error) {
    console.error('Failed to update forex rates:', error);
    throw new AppError('Failed to update forex rates', 500, 'FOREX_UPDATE_FAILED');
  }
};

/**
 * Allocate forex to a purchase order (FR-021)
 * @param {Object} options - Allocation options
 * @param {number} options.purchaseOrderId - Purchase Order ID
 * @param {number} options.allocatedAmount - Amount to allocate
 * @param {number} options.rate - Exchange rate to use
 * @returns {Promise<Object>} Created forex allocation
 */
const allocateForex = async ({ purchaseOrderId, allocatedAmount, rate }) => {
  const prisma = require('../../utils/prisma');

  try {
    // Verify PO exists and is in valid state
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { forexAllocations: true }
    });

    if (!po) {
      throw new AppError('Purchase order not found', 404, 'PO_NOT_FOUND');
    }

    if (po.status === 'CANCELLED' || po.status === 'COMPLETED') {
      throw new AppError('Cannot allocate forex to cancelled or completed PO', 400, 'INVALID_PO_STATUS');
    }

    // Calculate total already allocated
    const totalAllocated = po.forexAlocations.reduce(
      (sum, alloc) => sum + parseFloat(alloc.allocatedAmount),
      0
    );

    // Check if allocation exceeds PO total
    if (totalAllocated + allocatedAmount > parseFloat(po.totalAmount)) {
      throw new AppError(
        `Total allocation would exceed PO amount. Already allocated: ${totalAllocated}, PO total: ${po.totalAmount}`,
        400,
        'ALLOCATION_EXCEEDS_PO'
      );
    }

    // Create forex allocation
    const allocation = await prisma.forexAlocation.create({
      data: {
        purchaseOrderId,
        allocatedAmount,
        rate
      }
    });

    // Update PO with forex rate if not set
    if (!po.forexRate) {
      await prisma.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { forexRate: rate }
      });
    }

    console.log(`Forex allocated: ${allocatedAmount} at rate ${rate} for PO #${purchaseOrderId}`);
    return allocation;
  } catch (error) {
    console.error('Failed to allocate forex:', error);
    throw error;
  }
};

/**
 * Get prioritized list of POs for forex allocation (FR-021)
 * @param {Object} options - Query options
 * @param {number} options.budget - Available budget in ETB
 * @param {string} options.currency - Currency (default: USD)
 * @returns {Promise<Array>} Prioritized PO list
 */
const getPrioritizedPOs = async ({ budget, currency = 'USD' }) => {
  try {
    // Get current forex rate
    const currentRate = await fetchForexRate(currency);

    // Get pending POs awaiting forex allocation
    const pendingPOs = await prisma.purchaseOrder.findMany({
      where: {
        status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED'] },
        currency
      },
      include: {
        supplier: true,
        forexAllocations: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        expectedDate: 'asc' // Prioritize by earliest expected date
      }
    });

    // Calculate remaining amount needed for each PO and prioritize
    const prioritized = pendingPOs.map(po => {
      const totalAllocated = po.forexAlocations.reduce(
        (sum, alloc) => sum + parseFloat(alloc.allocatedAmount),
        0
      );
      const remainingAmount = parseFloat(po.totalAmount) - totalAllocated;
      const remainingETB = remainingAmount * currentRate.rateToETB;

      return {
        ...po,
        remainingAmount,
        remainingETB,
        canFulfill: remainingETB <= budget,
        priority: po.expectedDate // Earlier dates = higher priority
      };
    });

    // Sort by priority (earliest first)
    prioritized.sort((a, b) => new Date(a.priority) - new Date(b.priority));

    return {
      budget,
      currency,
      currentRate: currentRate.rateToETB,
      pos: prioritized,
      summary: {
        totalPOs: prioritized.length,
        fulfillableCount: prioritized.filter(po => po.canFulfill).length,
        totalRequiredETB: prioritized.reduce((sum, po) => sum + po.remainingETB, 0)
      }
    };
  } catch (error) {
    console.error('Failed to get prioritized POs:', error);
    throw error;
  }
};

module.exports = {
  fetchForexRate,
  updateForexRates,
  allocateForex,
  getPrioritizedPOs
};
