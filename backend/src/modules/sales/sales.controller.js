const salesService = require('./sales.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas
const salesOrderSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.customerId) {
    errors.push({ message: 'customerId is required', path: ['customerId'] });
  } else {
    value.customerId = parseInt(data.customerId);
  }

  if (!data.warehouseId) {
    errors.push({ message: 'warehouseId is required', path: ['warehouseId'] });
  } else {
    value.warehouseId = parseInt(data.warehouseId);
  }

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

      if (!item.quantity || item.quantity <= 0) {
        itemErrors.push({ message: 'quantity must be positive', path: ['items', index, 'quantity'] });
      } else {
        itemValue.quantity = parseFloat(item.quantity);
      }

      if (itemErrors.length > 0) {
        errors.push(...itemErrors);
      }

      return itemValue;
    });
  }

  if (data.requiredDate) {
    const date = new Date(data.requiredDate);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'requiredDate must be a valid date', path: ['requiredDate'] });
    } else {
      value.requiredDate = date;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const orderStatusSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.status) {
    errors.push({ message: 'status is required', path: ['status'] });
  } else {
    value.status = data.status.toUpperCase();
  }

  value.trackingNumber = data.trackingNumber || null;

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const returnSchema = async (data) => {
  const errors = [];
  const value = {};

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

      if (item.batchId) {
        itemValue.batchId = parseInt(item.batchId);
      }

      if (!item.quantity || item.quantity <= 0) {
        itemErrors.push({ message: 'quantity must be positive', path: ['items', index, 'quantity'] });
      } else {
        itemValue.quantity = parseFloat(item.quantity);
      }

      if (!item.reason) {
        itemErrors.push({ message: 'reason is required', path: ['items', index, 'reason'] });
      } else {
        itemValue.reason = item.reason;
      }

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

const dispositionSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push({ message: 'At least one item is required', path: ['items'] });
  } else {
    value.items = data.items.map((item, index) => {
      const itemErrors = [];
      const itemValue = {};

      if (!item.returnItemId) {
        itemErrors.push({ message: 'returnItemId is required', path: ['items', index, 'returnItemId'] });
      } else {
        itemValue.returnItemId = parseInt(item.returnItemId);
      }

      if (!item.disposition) {
        itemErrors.push({ message: 'disposition is required', path: ['items', index, 'disposition'] });
      } else {
        itemValue.disposition = item.disposition.toUpperCase();
      }

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

/**
 * Sales Controller
 * Handles sales orders, returns, and customer portal
 */
class SalesController {
  /**
   * POST /api/v1/sales-orders
   * Create a new sales order
   */
  async createSalesOrder(req, res, next) {
    try {
      const validated = await salesOrderSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const order = await salesService.createSalesOrder(validated.value, req.user.id);

      return successResponse(res, order, 'Sales order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/sales-orders
   * List orders with filters
   */
  async listSalesOrders(req, res, next) {
    try {
      const { status, customerId, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
      
      const filters = {
        status,
        customerId: customerId ? parseInt(customerId) : undefined,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await salesService.listSalesOrders(filters);

      return successResponse(res, result, 'Sales orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/sales-orders/:id
   * Order details
   */
  async getSalesOrder(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return errorResponse(res, 'Invalid sales order ID', 'INVALID_ID', 400);
      }

      const order = await salesService.getSalesOrderById(orderId);

      return successResponse(res, order, 'Sales order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/sales-orders/:id/status
   * Update order status (e.g., PICKING, SHIPPED)
   */
  async updateOrderStatus(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return errorResponse(res, 'Invalid sales order ID', 'INVALID_ID', 400);
      }

      const validated = await orderStatusSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const order = await salesService.updateOrderStatus(orderId, validated.value.status, validated.value.trackingNumber, req.user.id);

      return successResponse(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/sales-orders/:id/returns
   * Log a return
   */
  async createReturn(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return errorResponse(res, 'Invalid sales order ID', 'INVALID_ID', 400);
      }

      const validated = await returnSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const returnObj = await salesService.createReturn(orderId, validated.value, req.user.id);

      return successResponse(res, returnObj, 'Return created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/returns/:id
   * Return details
   */
  async getReturn(req, res, next) {
    try {
      const returnId = parseInt(req.params.id);
      
      if (isNaN(returnId)) {
        return errorResponse(res, 'Invalid return ID', 'INVALID_ID', 400);
      }

      const returnObj = await salesService.getReturnById(returnId);

      return successResponse(res, returnObj, 'Return retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/returns/:id/disposition
   * Set disposition (RESTOCK / SCRAP)
   */
  async setDisposition(req, res, next) {
    try {
      const returnId = parseInt(req.params.id);
      
      if (isNaN(returnId)) {
        return errorResponse(res, 'Invalid return ID', 'INVALID_ID', 400);
      }

      const validated = await dispositionSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const returnObj = await salesService.setDisposition(returnId, validated.value.items, req.user.id);

      return successResponse(res, returnObj, 'Return disposition updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customer-portal/stock
   * Customer stock visibility portal (limited access)
   */
  async getCustomerStock(req, res, next) {
    try {
      // For customer portal, user should have limited role
      const customerId = req.user.customerId; // Assuming user has customerId attached
      
      if (!customerId) {
        return errorResponse(res, 'Customer ID not found for this user', 'MISSING_CUSTOMER', 400);
      }

      const { productId, warehouseId } = req.query;

      const stock = await salesService.getCustomerStock(customerId, {
        productId: productId ? parseInt(productId) : undefined,
        warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      });

      return successResponse(res, stock, 'Customer stock retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SalesController();
module.exports.salesOrderSchema = salesOrderSchema;
module.exports.orderStatusSchema = orderStatusSchema;
module.exports.returnSchema = returnSchema;
module.exports.dispositionSchema = dispositionSchema;
