/**
 * Inventory Utility Functions
 * Implements FIFO, FEFO, and Weighted Average Cost calculations
 */

/**
 * Apply FIFO (First-In-First-Out) logic to a list of batches
 * @param {Array} batches - Array of batch objects with quantity and cost
 * @param {number} quantityToConsume - Amount to consume
 * @returns {Object} { consumed: [], remaining: [], totalCost: number }
 */
function applyFIFO(batches, quantityToConsume) {
  const sortedBatches = [...batches].sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));
  let remainingQty = quantityToConsume;
  const consumed = [];
  let totalCost = 0;

  for (const batch of sortedBatches) {
    if (remainingQty <= 0) break;

    const takeQty = Math.min(batch.quantity, remainingQty);
    
    consumed.push({
      batchId: batch.id,
      quantity: takeQty,
      costPerUnit: batch.costPrice,
      totalCost: takeQty * batch.costPrice
    });

    totalCost += takeQty * batch.costPrice;
    remainingQty -= takeQty;
  }

  if (remainingQty > 0) {
    throw new Error(`Insufficient stock. Still need: ${remainingQty}`);
  }

  return { consumed, totalCost };
}

/**
 * Apply FEFO (First-Expired-First-Out) logic
 * @param {Array} batches - Array of batch objects with quantity, cost, expiresAt
 * @param {number} quantityToConsume - Amount to consume
 * @returns {Object} { consumed: [], remaining: [], totalCost: number }
 */
function applyFEFO(batches, quantityToConsume) {
  const sortedBatches = [...batches].sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
  let remainingQty = quantityToConsume;
  const consumed = [];
  let totalCost = 0;

  for (const batch of sortedBatches) {
    if (remainingQty <= 0) break;

    // Skip expired batches
    if (new Date(batch.expiresAt) < new Date()) {
      continue; // Or handle as waste
    }

    const takeQty = Math.min(batch.quantity, remainingQty);
    
    consumed.push({
      batchId: batch.id,
      quantity: takeQty,
      costPerUnit: batch.costPrice,
      totalCost: takeQty * batch.costPrice
    });

    totalCost += takeQty * batch.costPrice;
    remainingQty -= takeQty;
  }

  if (remainingQty > 0) {
    throw new Error(`Insufficient non-expired stock. Still need: ${remainingQty}`);
  }

  return { consumed, totalCost };
}

/**
 * Calculate Moving Average Cost
 * @param {number} currentQty - Current quantity in stock
 * @param {number} currentAvgCost - Current average cost
 * @param {number} addedQty - Quantity being added
 * @param {number} addedCost - Cost per unit of added quantity
 * @returns {number} New average cost
 */
function calculateMovingAverage(currentQty, currentAvgCost, addedQty, addedCost) {
  if (addedQty <= 0) return currentAvgCost;
  
  const totalCurrentValue = currentQty * currentAvgCost;
  const totalAddedValue = addedQty * addedCost;
  const newTotalQty = currentQty + addedQty;
  
  return (totalCurrentValue + totalAddedValue) / newTotalQty;
}

/**
 * Calculate inventory valuation
 * @param {Array} stockLevels - Array of stock level objects
 * @returns {Object} { totalValue, totalQty, byWarehouse, byItem }
 */
function calculateInventoryValuation(stockLevels) {
  let totalValue = 0;
  let totalQty = 0;
  const byWarehouse = {};
  const byItem = {};

  for (const stock of stockLevels) {
    const value = stock.quantity * (stock.avgCost || 0);
    
    totalValue += value;
    totalQty += stock.quantity;

    // By Warehouse
    if (!byWarehouse[stock.warehouseId]) {
      byWarehouse[stock.warehouseId] = { value: 0, qty: 0 };
    }
    byWarehouse[stock.warehouseId].value += value;
    byWarehouse[stock.warehouseId].qty += stock.quantity;

    // By Item
    if (!byItem[stock.itemId]) {
      byItem[stock.itemId] = { value: 0, qty: 0 };
    }
    byItem[stock.itemId].value += value;
    byItem[stock.itemId].qty += stock.quantity;
  }

  return { totalValue, totalQty, byWarehouse, byItem };
}

/**
 * Check if batch is near expiry
 * @param {Date} expiresAt - Expiry date
 * @param {number} thresholdDays - Warning threshold in days
 * @returns {boolean}
 */
function isNearExpiry(expiresAt, thresholdDays = 30) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= thresholdDays && diffDays >= 0;
}

/**
 * Check if batch is expired
 * @param {Date} expiresAt - Expiry date
 * @returns {boolean}
 */
function isExpired(expiresAt) {
  return new Date(expiresAt) < new Date();
}

module.exports = {
  applyFIFO,
  applyFEFO,
  calculateMovingAverage,
  calculateInventoryValuation,
  isNearExpiry,
  isExpired
};
