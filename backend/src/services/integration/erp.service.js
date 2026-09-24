const prisma = require('../utils/prisma');

/**
 * Sync data with external ERP system (FR-078)
 * @param {string} direction - 'TO_ERP' or 'FROM_ERP'
 * @param {Object} options - Sync options
 * @returns {Promise<Object>} Sync result
 */
const syncWithERP = async (direction, options = {}) => {
  const config = require('../config');
  const axios = require('axios');

  if (!config.ERP_API_URL || !config.ERP_API_KEY) {
    console.warn('ERP integration not configured. Skipping sync.');
    return { success: false, message: 'ERP integration not configured' };
  }

  try {
    if (direction === 'TO_ERP') {
      // Send inventory data to ERP
      const stockData = await prisma.stock.findMany({
        where: options.where || {},
        include: {
          batch: {
            include: {
              product: true
            }
          },
          warehouse: true,
          bin: true
        },
        take: options.limit || 1000
      });

      const payload = {
        timestamp: new Date().toISOString(),
        type: 'INVENTORY_SYNC',
        data: stockData.map(s => ({
          sku: s.batch.product.sku,
          batchNumber: s.batch.batchNumber,
          quantity: s.quantity.toString(),
          warehouseId: s.warehouseId,
          binLabel: s.bin?.label,
          costPrice: s.costPrice.toString()
        }))
      };

      const response = await axios.post(
        `${config.ERP_API_URL}/api/inventory/sync`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${config.ERP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        direction: 'TO_ERP',
        recordCount: stockData.length,
        erpResponse: response.data
      };
    } else if (direction === 'FROM_ERP') {
      // Fetch data from ERP
      const response = await axios.get(
        `${config.ERP_API_URL}/api/purchase-orders/pending`,
        {
          headers: {
            'Authorization': `Bearer ${config.ERP_API_KEY}`
          }
        }
      );

      // Process incoming POs (implementation depends on ERP format)
      return {
        success: true,
        direction: 'FROM_ERP',
        data: response.data
      };
    }

    throw new Error('Invalid sync direction. Use TO_ERP or FROM_ERP');
  } catch (error) {
    console.error('ERP sync failed:', error.message);
    return {
      success: false,
      error: error.message,
      direction
    };
  }
};

module.exports = {
  syncWithERP
};
