/**
 * Inventory utilities for AIMS
 * Provides helper functions for FEFO, FIFO, and cost calculations
 */

/**
 * Select the best batch for picking based on FEFO (First Expired, First Out)
 * @param {Array} batches - Array of batches with expiry dates and quantities
 * @param {number} quantityNeeded - Quantity needed to pick
 * @returns {Array} - Array of batch selections with quantities
 */
const selectBatchesFEFO = (batches, quantityNeeded) => {
  // Sort batches by expiry date (earliest first)
  const sortedBatches = [...batches].sort((a, b) => 
    new Date(a.expiryDate) - new Date(b.expiryDate)
  );

  const selections = [];
  let remainingNeeded = parseFloat(quantityNeeded);

  for (const batch of sortedBatches) {
    if (remainingNeeded <= 0) break;

    const availableQty = parseFloat(batch.availableQuantity || batch.quantity);
    if (availableQty <= 0) continue;

    const quantityToPick = Math.min(remainingNeeded, availableQty);
    
    selections.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      quantity: quantityToPick
    });

    remainingNeeded -= quantityToPick;
  }

  if (remainingNeeded > 0) {
    throw new Error(`Insufficient stock. Still need ${remainingNeeded} units`);
  }

  return selections;
};

/**
 * Calculate cost of goods sold using FIFO (First In, First Out) method
 * @param {Array} stockLayers - Array of stock layers with cost prices and quantities
 * @param {number} quantity - Quantity to calculate cost for
 * @returns {Object} - { totalCost, averageCost, layers }
 */
const calculateFIFOCost = (stockLayers, quantity) => {
  const sortedLayers = [...stockLayers].sort((a, b) => 
    new Date(a.receivedDate) - new Date(b.receivedDate)
  );

  let remainingQty = parseFloat(quantity);
  let totalCost = 0;
  const usedLayers = [];

  for (const layer of sortedLayers) {
    if (remainingQty <= 0) break;

    const availableQty = parseFloat(layer.quantity);
    if (availableQty <= 0) continue;

    const qtyToUse = Math.min(remainingQty, availableQty);
    const layerCost = parseFloat(layer.costPrice);
    
    totalCost += qtyToUse * layerCost;
    usedLayers.push({
      layerId: layer.id,
      quantityUsed: qtyToUse,
      costPrice: layerCost,
      totalLayerCost: qtyToUse * layerCost
    });

    remainingQty -= qtyToUse;
  }

  if (remainingQty > 0) {
    throw new Error(`Insufficient stock layers. Still need ${remainingQty} units`);
  }

  const averageCost = totalCost / parseFloat(quantity);

  return {
    totalCost: parseFloat(totalCost.toFixed(2)),
    averageCost: parseFloat(averageCost.toFixed(4)),
    layers: usedLayers
  };
};

/**
 * Calculate weighted average cost for inventory valuation
 * @param {Array} stockLayers - Array of stock layers with cost prices and quantities
 * @returns {number} - Weighted average cost per unit
 */
const calculateWeightedAverageCost = (stockLayers) => {
  let totalValue = 0;
  let totalQuantity = 0;

  for (const layer of stockLayers) {
    const qty = parseFloat(layer.quantity);
    const cost = parseFloat(layer.costPrice);
    
    totalValue += qty * cost;
    totalQuantity += qty;
  }

  if (totalQuantity === 0) return 0;

  return parseFloat((totalValue / totalQuantity).toFixed(4));
};

/**
 * Check if a batch is expired or nearing expiry
 * @param {Date} expiryDate - Batch expiry date
 * @param {number} warningDays - Number of days before expiry to warn (default: 90)
 * @returns {Object} - { isExpired, isExpiringSoon, daysRemaining, status }
 */
const checkBatchExpiryStatus = (expiryDate, warningDays = 90) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  return {
    isExpired: daysRemaining < 0,
    isExpiringSoon: daysRemaining >= 0 && daysRemaining <= warningDays,
    daysRemaining,
    status: daysRemaining < 0 ? 'EXPIRED' : 
            daysRemaining <= warningDays ? 'EXPIRING_SOON' : 'OK'
  };
};

/**
 * Validate stock quantity for an operation
 * @param {number} currentStock - Current stock level
 * @param {number} quantity - Quantity to add/remove (negative for removal)
 * @param {boolean} allowNegative - Whether to allow negative stock (default: false)
 * @returns {Object} - { isValid, newStock, error }
 */
const validateStockQuantity = (currentStock, quantity, allowNegative = false) => {
  const current = parseFloat(currentStock);
  const qty = parseFloat(quantity);
  const newStock = current + qty;

  if (!allowNegative && newStock < 0) {
    return {
      isValid: false,
      newStock: null,
      error: `Insufficient stock. Current: ${current}, Requested: ${Math.abs(qty)}`
    };
  }

  return {
    isValid: true,
    newStock: parseFloat(newStock.toFixed(4)),
    error: null
  };
};

module.exports = {
  selectBatchesFEFO,
  calculateFIFOCost,
  calculateWeightedAverageCost,
  checkBatchExpiryStatus,
  validateStockQuantity
};
