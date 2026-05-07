const inventoryService = require('./inventory.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');
const validate = require('../../middleware/validate');

// Validation schemas
const stockQuerySchema = async (query) => {
  const errors = [];
  const value = {};

  if (query.warehouseId) {
    const warehouseId = parseInt(query.warehouseId);
    if (isNaN(warehouseId)) {
      errors.push({ message: 'warehouseId must be a number', path: ['warehouseId'] });
    } else {
      value.warehouseId = warehouseId;
    }
  }

  if (query.productId) {
    const productId = parseInt(query.productId);
    if (isNaN(productId)) {
      errors.push({ message: 'productId must be a number', path: ['productId'] });
    } else {
      value.productId = productId;
    }
  }

  if (query.batchId) {
    const batchId = parseInt(query.batchId);
    if (isNaN(batchId)) {
      errors.push({ message: 'batchId must be a number', path: ['batchId'] });
    } else {
      value.batchId = batchId;
    }
  }

  if (query.expiringBefore) {
    const date = new Date(query.expiringBefore);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'expiringBefore must be a valid date', path: ['expiringBefore'] });
    } else {
      value.expiringBefore = date;
    }
  }

  if (query.zoneType) {
    value.zoneType = query.zoneType.toUpperCase();
  }

  if (query.binLabel) {
    value.binLabel = query.binLabel;
  }

  value.page = query.page ? parseInt(query.page) : 1;
  value.limit = query.limit ? parseInt(query.limit) : 50;

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const receiptSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.warehouseId) {
    errors.push({ message: 'warehouseId is required', path: ['warehouseId'] });
  } else {
    value.warehouseId = parseInt(data.warehouseId);
  }

  if (data.purchaseOrderItemId) {
    value.purchaseOrderItemId = parseInt(data.purchaseOrderItemId);
  }

  value.iImportPermit = data.iImportPermit || null;

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push({ message: 'At least one item is required', path: ['items'] });
  } else {
    value.items = data.items.map((item, index) => {
      const itemErrors = [];
      const itemValue = {};

      if (!item.productId) {
        itemErrors.push({ message: 'productId is required', path: ['items', index, 'productId'] });
      } else {
        itemValue.productId = parseInt(item.productId);
      }

      if (!item.batchNumber) {
        itemErrors.push({ message: 'batchNumber is required', path: ['items', index, 'batchNumber'] });
      } else {
        itemValue.batchNumber = item.batchNumber;
      }

      if (!item.manufactureDate) {
        itemErrors.push({ message: 'manufactureDate is required', path: ['items', index, 'manufactureDate'] });
      } else {
        itemValue.manufactureDate = new Date(item.manufactureDate);
      }

      if (!item.expiryDate) {
        itemErrors.push({ message: 'expiryDate is required', path: ['items', index, 'expiryDate'] });
      } else {
        itemValue.expiryDate = new Date(item.expiryDate);
      }

      if (!item.quantity || item.quantity <= 0) {
        itemErrors.push({ message: 'quantity must be positive', path: ['items', index, 'quantity'] });
      } else {
        itemValue.quantity = parseFloat(item.quantity);
      }

      if (!item.unitCost || item.unitCost < 0) {
        itemErrors.push({ message: 'unitCost is required', path: ['items', index, 'unitCost'] });
      } else {
        itemValue.unitCost = parseFloat(item.unitCost);
      }

      itemValue.currency = item.currency || 'USD';
      itemValue.labTestRequired = item.labTestRequired || false;

      if (itemErrors.length > 0) {
        errors.push(...itemErrors);
      }

      return itemValue;
    });
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const transferSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.fromStockId) {
    errors.push({ message: 'fromStockId is required', path: ['fromStockId'] });
  } else {
    value.fromStockId = parseInt(data.fromStockId);
  }

  if (!data.toWarehouseId) {
    errors.push({ message: 'toWarehouseId is required', path: ['toWarehouseId'] });
  } else {
    value.toWarehouseId = parseInt(data.toWarehouseId);
  }

  if (data.toBinLabel) {
    value.toBinLabel = data.toBinLabel;
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push({ message: 'quantity must be positive', path: ['quantity'] });
  } else {
    value.quantity = parseFloat(data.quantity);
  }

  value.reason = data.reason || '';

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const adjustmentSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.stockId) {
    errors.push({ message: 'stockId is required', path: ['stockId'] });
  } else {
    value.stockId = parseInt(data.stockId);
  }

  if (data.adjustedQuantity === undefined || data.adjustedQuantity === null) {
    errors.push({ message: 'adjustedQuantity is required', path: ['adjustedQuantity'] });
  } else {
    value.adjustedQuantity = parseFloat(data.adjustedQuantity);
  }

  if (!data.reason) {
    errors.push({ message: 'reason is required', path: ['reason'] });
  } else {
    value.reason = data.reason;
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const disposeSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.stockId) {
    errors.push({ message: 'stockId is required', path: ['stockId'] });
  } else {
    value.stockId = parseInt(data.stockId);
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push({ message: 'quantity must be positive', path: ['quantity'] });
  } else {
    value.quantity = parseFloat(data.quantity);
  }

  if (!data.disposalMethod) {
    errors.push({ message: 'disposalMethod is required', path: ['disposalMethod'] });
  } else {
    value.disposalMethod = data.disposalMethod;
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const reserveSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.warehouseId) {
    errors.push({ message: 'warehouseId is required', path: ['warehouseId'] });
  } else {
    value.warehouseId = parseInt(data.warehouseId);
  }

  if (!data.productId) {
    errors.push({ message: 'productId is required', path: ['productId'] });
  } else {
    value.productId = parseInt(data.productId);
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push({ message: 'quantity must be positive', path: ['quantity'] });
  } else {
    value.quantity = parseFloat(data.quantity);
  }

  value.orderReference = data.orderReference || null;

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * Inventory Controller
 * Handles stock management, receipts, transfers, adjustments, and picking
 */
class InventoryController {
  /**
   * GET /api/v1/stock
   * List stock across warehouses with filters
   */
  async listStock(req, res, next) {
    try {
      const validated = await stockQuerySchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      req.validatedQuery = validated.value;
      const result = await inventoryService.listStock(validated.value);

      return successResponse(res, result, 'Stock retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/stock/:stockId
   * Get a single stock record details
   */
  async getStock(req, res, next) {
    try {
      const stockId = parseInt(req.params.stockId);
      
      if (isNaN(stockId)) {
        return errorResponse(res, 'Invalid stock ID', 'INVALID_ID', 400);
      }

      const stock = await inventoryService.getStockById(stockId);

      return successResponse(res, stock, 'Stock retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/receipts
   * Create a new inbound receipt
   */
  async createReceipt(req, res, next) {
    try {
      const validated = await receiptSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const receipt = await inventoryService.createReceipt(validated.value, req.user.id);

      return successResponse(res, receipt, 'Receipt created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/receipts/:id
   * Get receipt details
   */
  async getReceipt(req, res, next) {
    try {
      const receiptId = parseInt(req.params.id);
      
      if (isNaN(receiptId)) {
        return errorResponse(res, 'Invalid receipt ID', 'INVALID_ID', 400);
      }

      const receipt = await inventoryService.getReceiptById(receiptId);

      return successResponse(res, receipt, 'Receipt retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/receipts/:id/accept
   * Accept items after quality check
   */
  async acceptReceipt(req, res, next) {
    try {
      const receiptId = parseInt(req.params.id);
      
      if (isNaN(receiptId)) {
        return errorResponse(res, 'Invalid receipt ID', 'INVALID_ID', 400);
      }

      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return errorResponse(res, 'Items array is required', 'MISSING_ITEMS', 400);
      }

      const receipt = await inventoryService.acceptReceipt(receiptId, items, req.user.id);

      return successResponse(res, receipt, 'Receipt accepted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/stock/transfer
   * Transfer stock between bins/warehouses
   */
  async transferStock(req, res, next) {
    try {
      const validated = await transferSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await inventoryService.transferStock(validated.value, req.user.id);

      return successResponse(res, result, 'Stock transferred successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/stock/adjustment
   * Manual inventory adjustment (shrinkage)
   */
  async adjustStock(req, res, next) {
    try {
      const validated = await adjustmentSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await inventoryService.adjustStock(validated.value, req.user.id);

      return successResponse(res, result, 'Stock adjusted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/stock/dispose
   * Dispose of expired/damaged stock
   */
  async disposeStock(req, res, next) {
    try {
      const validated = await disposeSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await inventoryService.disposeStock(validated.value, req.user.id);

      return successResponse(res, result, 'Stock disposed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/picking/reserve
   * Reserve stock for an order (FEFO)
   */
  async reserveStock(req, res, next) {
    try {
      const validated = await reserveSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await inventoryService.reserveStock(validated.value);

      return successResponse(res, result, 'Stock reserved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/picking/confirm
   * Confirm pick and deduct stock
   */
  async confirmPick(req, res, next) {
    try {
      const { reservationId, actualQty, binLabel } = req.body;

      if (!reservationId) {
        return errorResponse(res, 'reservationId is required', 'MISSING_FIELD', 400);
      }

      const result = await inventoryService.confirmPick(
        parseInt(reservationId),
        actualQty ? parseFloat(actualQty) : null,
        binLabel,
        req.user.id
      );

      return successResponse(res, result, 'Pick confirmed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/picking/pick-and-ship
   * One-step pick+ship for a sales order
   */
  async pickAndShip(req, res, next) {
    try {
      const { salesOrderId, pickedItems } = req.body;

      if (!salesOrderId) {
        return errorResponse(res, 'salesOrderId is required', 'MISSING_FIELD', 400);
      }

      if (!pickedItems || !Array.isArray(pickedItems) || pickedItems.length === 0) {
        return errorResponse(res, 'pickedItems array is required', 'MISSING_ITEMS', 400);
      }

      const result = await inventoryService.pickAndShip(
        parseInt(salesOrderId),
        pickedItems,
        req.user.id
      );

      return successResponse(res, result, 'Order picked and shipped successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
module.exports.stockQuerySchema = stockQuerySchema;
module.exports.receiptSchema = receiptSchema;
module.exports.transferSchema = transferSchema;
module.exports.adjustmentSchema = adjustmentSchema;
module.exports.disposeSchema = disposeSchema;
module.exports.reserveSchema = reserveSchema;
