const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../utils/customErrors');
const { calculateMovingAverage, applyFIFO } = require('./inventory.utils');
const auditService = require('../../services/audit.service');

const prisma = new PrismaClient();

/**
 * Get stock levels with optional filters
 */
async function getStockLevels({ warehouseId, itemId, batchId }) {
  const where = { quantity: { gt: 0 } };
  if (warehouseId) where.warehouseId = warehouseId;
  if (itemId) where.itemId = itemId;
  if (batchId) where.batchId = batchId;

  return prisma.stockLevel.findMany({
    where,
    include: {
      item: true,
      warehouse: true,
      batch: {
        include: {
          item: true,
          supplier: true
        }
      }
    },
    orderBy: { expiresAt: 'asc' } // FEFO ordering
  });
}

/**
 * Create a goods receipt (GRN)
 */
async function createGoodsReceipt(data, userId) {
  const { warehouseId, items, supplierId, poNumber, qualityStatus = 'PENDING' } = data;

  // Start transaction for atomicity
  return prisma.$transaction(async (tx) => {
    const receipt = await tx.goodsReceipt.create({
      data: {
        warehouseId,
        supplierId,
        poNumber,
        receivedBy: userId,
        status: 'COMPLETED',
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantityReceived: item.quantity,
            qualityStatus,
            // Batch creation logic would go here based on expiry dates
            batches: {
              create: {
                itemId: item.itemId,
                quantity: item.quantity,
                manufacturingDate: item.manufacturingDate,
                expiresAt: item.expiresAt,
                costPrice: item.costPrice,
                status: qualityStatus === 'ACCEPTED' ? 'ACTIVE' : 'QUARANTINE'
              }
            }
          }))
        }
      },
      include: { items: { include: { batches: true } } }
    });

    // Update Stock Levels
    for (const receiptItem of receipt.items) {
      for (const batch of receiptItem.batches) {
        await tx.stockLevel.upsert({
          where: {
            warehouseId_itemId_batchId: {
              warehouseId,
              itemId: receiptItem.itemId,
              batchId: batch.id
            }
          },
          update: { quantity: { increment: batch.quantity } },
          create: {
            warehouseId,
            itemId: receiptItem.itemId,
            batchId: batch.id,
            quantity: batch.quantity,
            avgCost: batch.costPrice
          }
        });
      }
    }

    await auditService.logAction(tx, {
      userId,
      action: 'GOODS_RECEIPT_CREATED',
      entityType: 'GoodsReceipt',
      entityId: receipt.id,
      details: { poNumber, itemCount: items.length }
    });

    return receipt;
  });
}

/**
 * Process a stock transfer between warehouses
 */
async function transferStock(data, userId) {
  const { fromWarehouseId, toWarehouseId, items } = data;

  return prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.create({
      data: {
        fromWarehouseId,
        toWarehouseId,
        status: 'IN_TRANSIT',
        initiatedBy: userId,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            batchId: item.batchId,
            quantity: item.quantity,
            status: 'IN_TRANSIT'
          }))
        }
      },
      include: { items: true }
    });

    // Deduct from source
    for (const item of items) {
      await tx.stockLevel.update({
        where: {
          warehouseId_itemId_batchId: {
            warehouseId: fromWarehouseId,
            itemId: item.itemId,
            batchId: item.batchId
          }
        },
        data: { quantity: { decrement: item.quantity } }
      });
    }

    // Note: Destination stock is added only upon "Receive" action, not here
    
    await auditService.logAction(tx, {
      userId,
      action: 'STOCK_TRANSFER_INITIATED',
      entityType: 'StockTransfer',
      entityId: transfer.id,
      details: { fromWarehouseId, toWarehouseId }
    });

    return transfer;
  });
}

/**
 * Receive a stock transfer at destination
 */
async function receiveTransfer(transferId, userId) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.findUnique({
      where: { id: transferId },
      include: { items: true }
    });

    if (!transfer) throw new AppError('Transfer not found', 404);
    if (transfer.status === 'COMPLETED') throw new AppError('Transfer already completed', 400);

    // Add to destination warehouse
    for (const item of transfer.items) {
      await tx.stockLevel.upsert({
        where: {
          warehouseId_itemId_batchId: {
            warehouseId: transfer.toWarehouseId,
            itemId: item.itemId,
            batchId: item.batchId
          }
        },
        update: { quantity: { increment: item.quantity } },
        create: {
          warehouseId: transfer.toWarehouseId,
          itemId: item.itemId,
          batchId: item.batchId,
          quantity: item.quantity,
          avgCost: 0 // Cost carries over, simplified here
        }
      });
      
      await tx.transferItem.update({
        where: { id: item.id },
        data: { status: 'RECEIVED' }
      });
    }

    await tx.stockTransfer.update({
      where: { id: transferId },
      data: { status: 'COMPLETED', receivedAt: new Date() }
    });

    await auditService.logAction(tx, {
      userId,
      action: 'STOCK_TRANSFER_RECEIVED',
      entityType: 'StockTransfer',
      entityId: transferId
    });

    return transfer;
  });
}

/**
 * Pick stock for sales order (FEFO Logic)
 */
async function pickStockForOrder(orderId, userId) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { item: true } } }
    });

    if (!order) throw new AppError('Order not found', 404);

    const picks = [];

    for (const orderItem of order.items) {
      let remainingQty = orderItem.quantity;
      
      // Find available stock sorted by expiry (FEFO)
      const availableStock = await tx.stockLevel.findMany({
        where: {
          warehouseId: order.warehouseId,
          itemId: orderItem.itemId,
          quantity: { gt: 0 }
        },
        include: { batch: true },
        orderBy: { batch: { expiresAt: 'asc' } }
      });

      for (const stock of availableStock) {
        if (remainingQty <= 0) break;

        const pickQty = Math.min(stock.quantity, remainingQty);
        
        // Create pick record
        picks.push({
          orderId,
          itemId: orderItem.itemId,
          batchId: stock.batchId,
          quantity: pickQty,
          pickedAt: new Date(),
          pickedBy: userId
        });

        // Deduct stock
        await tx.stockLevel.update({
          where: { id: stock.id },
          data: { quantity: { decrement: pickQty } }
        });

        remainingQty -= pickQty;
      }

      if (remainingQty > 0) {
        throw new AppError(`Insufficient stock for item ${orderItem.itemId}. Missing: ${remainingQty}`, 400);
      }
    }

    await tx.pick.createMany({ data: picks });

    await tx.salesOrder.update({
      where: { id: orderId },
      data: { status: 'PICKED' }
    });

    return picks;
  });
}

module.exports = {
  getStockLevels,
  createGoodsReceipt,
  transferStock,
  receiveTransfer,
  pickStockForOrder
};
