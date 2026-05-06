const prisma = require('../utils/prisma');

/**
 * Send push notification via WebSocket/SSE
 * @param {Object} io - Socket.io instance
 * @param {string} event - Event name
 * @param {Object} data - Notification data
 * @param {number|string} [targetUserId] - Specific user ID (optional, broadcasts if not provided)
 */
const sendPushNotification = (io, event, data, targetUserId) => {
  if (!io) {
    console.warn('Socket.io instance not provided. Skipping push notification.');
    return;
  }

  if (targetUserId) {
    // Send to specific user room
    io.to(`user:${targetUserId}`).emit(event, data);
  } else {
    // Broadcast to all connected clients
    io.emit(event, data);
  }

  console.log(`Push notification sent: ${event}`);
};

/**
 * Send expiry alert notification
 * @param {Object} io - Socket.io instance
 * @param {Array} expiringBatches - Batches nearing expiry
 */
const notifyExpiryAlert = (io, expiringBatches) => {
  sendPushNotification(io, 'alert:expiry', {
    type: 'EXPIRY_ALERT',
    count: expiringBatches.length,
    batches: expiringBatches,
    timestamp: new Date().toISOString(),
    priority: 'HIGH'
  });
};

/**
 * Send stock-out risk notification
 * @param {Object} io - Socket.io instance
 * @param {Array} lowStockItems - Items below safety stock
 */
const notifyStockOutRisk = (io, lowStockItems) => {
  sendPushNotification(io, 'alert:stock-out', {
    type: 'STOCK_OUT_RISK',
    count: lowStockItems.length,
    items: lowStockItems,
    timestamp: new Date().toISOString(),
    priority: 'CRITICAL'
  });
};

/**
 * Send cold chain excursion notification
 * @param {Object} io - Socket.io instance
 * @param {Object} excursion - Excursion details
 */
const notifyColdChainExcursion = (io, excursion) => {
  sendPushNotification(io, 'alert:cold-chain', {
    type: 'COLD_CHAIN_EXCURSION',
    excursion,
    timestamp: new Date().toISOString(),
    priority: 'CRITICAL'
  });
};

/**
 * Send quality approval notification
 * @param {Object} io - Socket.io instance
 * @param {Object} batch - Batch details
 * @param {string} action - APPROVED or REJECTED
 */
const notifyQualityDecision = (io, batch, action) => {
  sendPushNotification(io, 'quality:decision', {
    type: 'QUALITY_DECISION',
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    action,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send recall notification
 * @param {Object} io - Socket.io instance
 * @param {Object} recall - Recall details
 */
const notifyRecall = (io, recall) => {
  sendPushNotification(io, 'alert:recall', {
    type: 'RECALL',
    recall,
    timestamp: new Date().toISOString(),
    priority: 'URGENT'
  });
};

/**
 * Send work order status update notification
 * @param {Object} io - Socket.io instance
 * @param {Object} workOrder - Work order details
 */
const notifyWorkOrderUpdate = (io, workOrder) => {
  sendPushNotification(io, 'production:work-order-update', {
    type: 'WORK_ORDER_UPDATE',
    workOrderId: workOrder.id,
    status: workOrder.status,
    productId: workOrder.productId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send purchase order status update notification
 * @param {Object} io - Socket.io instance
 * @param {Object} purchaseOrder - Purchase order details
 */
const notifyPurchaseOrderUpdate = (io, purchaseOrder) => {
  sendPushNotification(io, 'procurement:po-update', {
    type: 'PURCHASE_ORDER_UPDATE',
    purchaseOrderId: purchaseOrder.id,
    poNumber: purchaseOrder.poNumber,
    status: purchaseOrder.status,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  sendPushNotification,
  notifyExpiryAlert,
  notifyStockOutRisk,
  notifyColdChainExcursion,
  notifyQualityDecision,
  notifyRecall,
  notifyWorkOrderUpdate,
  notifyPurchaseOrderUpdate
};
