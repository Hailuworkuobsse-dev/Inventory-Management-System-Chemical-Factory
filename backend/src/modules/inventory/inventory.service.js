const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

class InventoryService {
  async listStock(filters) {
    const {
      warehouseId,
      productId,
      batchId,
      expiringBefore,
      zoneType,
      binLabel,
      page = 1,
      limit = 20
    } = filters;

    const where = {};

    if (warehouseId) where.warehouseId = parseInt(warehouseId);
    if (batchId) where.batchId = parseInt(batchId);
    if (productId) {
      where.batch = {
        productId: parseInt(productId)
      };
    }
    if (expiringBefore) {
      where.batch = {
        ...where.batch,
        expiryDate: {
          lt: new Date(expiringBefore)
        }
      };
    }
    if (zoneType) {
      where.zone = {
        type: zoneType
      };
    }
    if (binLabel) {
      where.bin = {
        label: {
          contains: binLabel
        }
      };
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [items, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        skip,
        take,
        include: {
          warehouse: true,
          zone: true,
          bin: true,
          batch: {
            include: {
              product: true
            }
          },
          costLayer: true
        },
        orderBy: {
          batch: {
            expiryDate: 'asc'
          }
        }
      }),
      prisma.stock.count({ where })
    ]);

    return {
      items,
      total,
      page: parseInt(page),
      limit: take
    };
  }

  async getStock(stockId) {
    const stock = await prisma.stock.findUnique({
      where: { id: parseInt(stockId) },
      include: {
        warehouse: true,
        zone: true,
        bin: true,
        batch: {
          include: {
            product: true,
            certificates: true,
            labTests: true
          }
        },
        costLayer: true,
        warehouse: {
          include: {
            zones: true
          }
        }
      }
    });

    if (!stock) {
      throw new AppError('Stock not found', 404, 'NOT_FOUND');
    }

    return stock;
  }

  async createReceipt(data) {
    const {
      warehouseId,
      purchaseOrderId,
      iImportPermit,
      items
    } = data;

    // Generate receipt number
    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create receipt with items
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        warehouseId,
        purchaseOrderId,
        iImportPermit,
        status: 'PENDING_INSPECTION',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            batchNumber: item.batchNumber,
            manufactureDate: new Date(item.manufactureDate),
            expiryDate: new Date(item.expiryDate),
            quantityReceived: item.quantity,
            unitCost: item.unitCost,
            currency: item.currency || 'USD',
            quarantine: true,
            labTestRequired: item.labTestRequired || false
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        warehouse: true
      }
    });

    return receipt;
  }

  async acceptReceipt(receiptId, acceptanceData) {
    const { items } = acceptanceData;

    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(receiptId) },
      include: { items: true, warehouse: true }
    });

    if (!receipt) {
      throw new AppError('Receipt not found', 404, 'NOT_FOUND');
    }

    // Update receipt items with accepted quantities
    for (const item of items) {
      await prisma.receiptItem.update({
        where: { id: item.receiptItemId },
        data: {
          quantityAccepted: item.quantityAccepted
        }
      });

      // Create or update batch
      const receiptItem = await prisma.receiptItem.findUnique({
        where: { id: item.receiptItemId },
        include: { product: true }
      });

      let batch = await prisma.batch.findFirst({
        where: {
          productId: receiptItem.productId,
          batchNumber: receiptItem.batchNumber
        }
      });

      if (!batch) {
        batch = await prisma.batch.create({
          data: {
            productId: receiptItem.productId,
            batchNumber: receiptItem.batchNumber,
            manufactureDate: receiptItem.manufactureDate,
            expiryDate: receiptItem.expiryDate,
            status: receiptItem.labTestRequired ? 'QUARANTINED' : 'RELEASED',
            createdFromReceiptItemId: receiptItem.id
          }
        });
      }

      // Create stock entry
      await prisma.stock.upsert({
        where: {
          warehouseId_batchId_binId: {
            warehouseId: receipt.warehouseId,
            batchId: batch.id,
            binId: null
          }
        },
        update: {
          quantity: {
            increment: item.quantityAccepted
          }
        },
        create: {
          warehouseId: receipt.warehouseId,
          batchId: batch.id,
          binId: null,
          quantity: item.quantityAccepted,
          unitCost: receiptItem.unitCost
        }
      });

      // Create cost layer
      await prisma.costLayer.create({
        data: {
          productId: receiptItem.productId,
          warehouseId: receipt.warehouseId,
          batchId: batch.id,
          receiptItemId: receiptItem.id,
          quantity: item.quantityAccepted,
          remainingQty: item.quantityAccepted,
          unitCost: receiptItem.unitCost,
          currency: receiptItem.currency
        }
      });

      // Create stock ledger entry
      await prisma.stockLedger.create({
        data: {
          transactionType: 'RECEIPT',
          productId: receiptItem.productId,
          batchId: batch.id,
          warehouseId: receipt.warehouseId,
          quantityChange: item.quantityAccepted,
          runningQuantity: item.quantityAccepted,
          referenceId: receiptItem.id,
          referenceType: 'ReceiptItem',
          createdBy: null
        }
      });
    }

    // Update receipt status
    const updatedReceipt = await prisma.receipt.update({
      where: { id: parseInt(receiptId) },
      data: {
        status: 'ACCEPTED'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return updatedReceipt;
  }

  async transferStock(data) {
    const { fromStockId, toWarehouseId, toBinLabel, quantity, reason } = data;

    const fromStock = await prisma.stock.findUnique({
      where: { id: parseInt(fromStockId) },
      include: { batch: true }
    });

    if (!fromStock) {
      throw new AppError('Source stock not found', 404, 'NOT_FOUND');
    }

    if (fromStock.quantity < quantity) {
      throw new AppError('Insufficient stock quantity', 400, 'INSUFFICIENT_STOCK');
    }

    // Find destination bin
    let destBin = null;
    if (toBinLabel) {
      const destZone = await prisma.zone.findFirst({
        where: { warehouseId: toWarehouseId }
      });
      if (destZone) {
        destBin = await prisma.bin.findFirst({
          where: {
            zoneId: destZone.id,
            label: toBinLabel
          }
        });
      }
    }

    // Deduct from source
    await prisma.stock.update({
      where: { id: parseInt(fromStockId) },
      data: {
        quantity: { decrement: quantity }
      }
    });

    // Add to destination
    await prisma.stock.upsert({
      where: {
        warehouseId_batchId_binId: {
          warehouseId: toWarehouseId,
          batchId: fromStock.batchId,
          binId: destBin?.id || null
        }
      },
      update: {
        quantity: { increment: quantity }
      },
      create: {
        warehouseId: toWarehouseId,
        batchId: fromStock.batchId,
        binId: destBin?.id || null,
        quantity: quantity,
        unitCost: fromStock.unitCost
      }
    });

    // Create ledger entries
    await prisma.stockLedger.create({
      data: {
        transactionType: 'TRANSFER',
        productId: fromStock.batch.productId,
        batchId: fromStock.batchId,
        warehouseId: fromStock.warehouseId,
        toBinId: destBin?.id,
        quantityChange: -quantity,
        runningQuantity: fromStock.quantity - quantity,
        referenceType: 'Transfer',
        createdBy: null
      }
    });

    return { message: 'Stock transferred successfully' };
  }

  async adjustStock(data) {
    const { stockId, adjustedQuantity, reason } = data;

    const stock = await prisma.stock.findUnique({
      where: { id: parseInt(stockId) },
      include: { batch: true }
    });

    if (!stock) {
      throw new AppError('Stock not found', 404, 'NOT_FOUND');
    }

    const quantityChange = adjustedQuantity - stock.quantity;

    await prisma.stock.update({
      where: { id: parseInt(stockId) },
      data: {
        quantity: adjustedQuantity
      }
    });

    await prisma.stockLedger.create({
      data: {
        transactionType: 'ADJUSTMENT',
        productId: stock.batch.productId,
        batchId: stock.batchId,
        warehouseId: stock.warehouseId,
        quantityChange: quantityChange,
        runningQuantity: adjustedQuantity,
        referenceType: 'Adjustment',
        createdBy: null
      }
    });

    return { message: 'Stock adjusted successfully' };
  }

  async disposeStock(data) {
    const { stockId, quantity, disposalMethod } = data;

    const stock = await prisma.stock.findUnique({
      where: { id: parseInt(stockId) },
      include: { batch: true }
    });

    if (!stock) {
      throw new AppError('Stock not found', 404, 'NOT_FOUND');
    }

    if (stock.quantity < quantity) {
      throw new AppError('Insufficient stock quantity', 400, 'INSUFFICIENT_STOCK');
    }

    await prisma.stock.update({
      where: { id: parseInt(stockId) },
      data: {
        quantity: { decrement: quantity }
      }
    });

    await prisma.stockLedger.create({
      data: {
        transactionType: 'DISPOSAL',
        productId: stock.batch.productId,
        batchId: stock.batchId,
        warehouseId: stock.warehouseId,
        quantityChange: -quantity,
        runningQuantity: stock.quantity - quantity,
        referenceType: 'Disposal',
        createdBy: null
      }
    });

    return { message: 'Stock disposed successfully' };
  }

  async reserveStock(data) {
    const { warehouseId, productId, quantity, orderReference } = data;

    // FEFO logic: find batches ordered by expiry date
    const stocks = await prisma.stock.findMany({
      where: {
        warehouseId,
        batch: {
          productId,
          status: 'RELEASED'
        },
        quantity: {
          gt: 0
        }
      },
      include: {
        batch: true
      },
      orderBy: {
        batch: {
          expiryDate: 'asc'
        }
      }
    });

    const reservations = [];
    let remainingQty = quantity;

    for (const stock of stocks) {
      if (remainingQty <= 0) break;

      const availableQty = stock.quantity - stock.reservedQty;
      if (availableQty > 0) {
        const reserveAmount = Math.min(availableQty, remainingQty);
        
        await prisma.stock.update({
          where: { id: stock.id },
          data: {
            reservedQty: { increment: reserveAmount }
          }
        });

        reservations.push({
          stockId: stock.id,
          batchId: stock.batchId,
          reservedQty: reserveAmount
        });

        remainingQty -= reserveAmount;
      }
    }

    if (remainingQty > 0) {
      throw new AppError(
        `Insufficient stock. Could only reserve ${quantity - remainingQty} of ${quantity}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    return { reservations };
  }

  async confirmPick(data) {
    const { reservationId, actualQty, binLabel } = data;

    // Implementation for confirming pick
    return { message: 'Pick confirmed successfully' };
  }

  async listReceipts(filters) {
    const { page = 1, limit = 20, status, warehouseId } = filters;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (warehouseId) where.warehouseId = parseInt(warehouseId);

    const [items, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        skip,
        take,
        include: {
          items: {
            include: {
              product: true
            }
          },
          warehouse: true,
          purchaseOrder: true
        },
        orderBy: { receivedDate: 'desc' }
      }),
      prisma.receipt.count({ where })
    ]);

    return { items, total, page: parseInt(page), limit: take };
  }

  async getReceipt(receiptId) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(receiptId) },
      include: {
        items: {
          include: {
            product: true
          }
        },
        warehouse: true,
        purchaseOrder: true
      }
    });

    if (!receipt) {
      throw new AppError('Receipt not found', 404, 'NOT_FOUND');
    }

    return receipt;
  }
}

module.exports = new InventoryService();
