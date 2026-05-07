const procurementService = require('./procurement.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas
const supplierSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.name) {
    errors.push({ message: 'name is required', path: ['name'] });
  } else {
    value.name = data.name;
  }

  value.contactPerson = data.contactPerson || null;
  value.email = data.email || null;
  value.phone = data.phone || null;
  value.address = data.address || null;
  value.isSanctioned = data.isSanctioned || false;

  if (data.certificateValidUntil) {
    const date = new Date(data.certificateValidUntil);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'certificateValidUntil must be a valid date', path: ['certificateValidUntil'] });
    } else {
      value.certificateValidUntil = date;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const purchaseOrderSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.supplierId) {
    errors.push({ message: 'supplierId is required', path: ['supplierId'] });
  } else {
    value.supplierId = parseInt(data.supplierId);
  }

  value.currency = data.currency || 'USD';

  if (data.lcId) {
    value.lcId = parseInt(data.lcId);
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

      if (!item.unitPrice || item.unitPrice < 0) {
        itemErrors.push({ message: 'unitPrice is required', path: ['items', index, 'unitPrice'] });
      } else {
        itemValue.unitPrice = parseFloat(item.unitPrice);
      }

      if (itemErrors.length > 0) {
        errors.push(...itemErrors);
      }

      return itemValue;
    });
  }

  if (!data.expectedDate) {
    errors.push({ message: 'expectedDate is required', path: ['expectedDate'] });
  } else {
    value.expectedDate = new Date(data.expectedDate);
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const forexAllocationSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.allocatedAmount || data.allocatedAmount <= 0) {
    errors.push({ message: 'allocatedAmount must be positive', path: ['allocatedAmount'] });
  } else {
    value.allocatedAmount = parseFloat(data.allocatedAmount);
  }

  if (!data.rate || data.rate <= 0) {
    errors.push({ message: 'rate must be positive', path: ['rate'] });
  } else {
    value.rate = parseFloat(data.rate);
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const forexRateSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.currency) {
    errors.push({ message: 'currency is required', path: ['currency'] });
  } else {
    value.currency = data.currency.toUpperCase();
  }

  if (!data.rateToETB || data.rateToETB <= 0) {
    errors.push({ message: 'rateToETB must be positive', path: ['rateToETB'] });
  } else {
    value.rateToETB = parseFloat(data.rateToETB);
  }

  value.source = data.source || 'NBE';

  if (data.effectiveDate) {
    const date = new Date(data.effectiveDate);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'effectiveDate must be a valid date', path: ['effectiveDate'] });
    } else {
      value.effectiveDate = date;
    }
  } else {
    value.effectiveDate = new Date();
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const supplierRatingSchema = async (data) => {
  const errors = [];
  const value = {};

  if (data.onTimeDelivery !== undefined) {
    value.onTimeDelivery = parseFloat(data.onTimeDelivery);
  }

  if (data.qualityScore !== undefined) {
    value.qualityScore = parseFloat(data.qualityScore);
  }

  if (data.overallScore !== undefined) {
    value.overallScore = parseFloat(data.overallScore);
  }

  if (!data.periodStart) {
    errors.push({ message: 'periodStart is required', path: ['periodStart'] });
  } else {
    value.periodStart = new Date(data.periodStart);
  }

  if (!data.periodEnd) {
    errors.push({ message: 'periodEnd is required', path: ['periodEnd'] });
  } else {
    value.periodEnd = new Date(data.periodEnd);
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * Procurement Controller
 * Handles suppliers, purchase orders, forex allocation, and LC management
 */
class ProcurementController {
  /**
   * GET /api/v1/suppliers
   * List suppliers
   */
  async listSuppliers(req, res, next) {
    try {
      const { isActive, search, page = 1, limit = 50 } = req.query;
      
      const result = await procurementService.listSuppliers({
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return successResponse(res, result, 'Suppliers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/suppliers
   * Create a supplier
   */
  async createSupplier(req, res, next) {
    try {
      const validated = await supplierSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const supplier = await procurementService.createSupplier(validated.value);

      return successResponse(res, supplier, 'Supplier created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/suppliers/:id
   * Update supplier details
   */
  async updateSupplier(req, res, next) {
    try {
      const supplierId = parseInt(req.params.id);
      
      if (isNaN(supplierId)) {
        return errorResponse(res, 'Invalid supplier ID', 'INVALID_ID', 400);
      }

      const validated = await supplierSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const supplier = await procurementService.updateSupplier(supplierId, validated.value);

      return successResponse(res, supplier, 'Supplier updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/suppliers/:id/ratings
   * Get supplier performance
   */
  async getSupplierRatings(req, res, next) {
    try {
      const supplierId = parseInt(req.params.id);
      
      if (isNaN(supplierId)) {
        return errorResponse(res, 'Invalid supplier ID', 'INVALID_ID', 400);
      }

      const { period } = req.query;

      const ratings = await procurementService.getSupplierRatings(supplierId, period);

      return successResponse(res, ratings, 'Supplier ratings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/suppliers/:id/ratings
   * Add/update rating
   */
  async createSupplierRating(req, res, next) {
    try {
      const supplierId = parseInt(req.params.id);
      
      if (isNaN(supplierId)) {
        return errorResponse(res, 'Invalid supplier ID', 'INVALID_ID', 400);
      }

      const validated = await supplierRatingSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const rating = await procurementService.createSupplierRating(supplierId, validated.value);

      return successResponse(res, rating, 'Supplier rating created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/purchase-orders
   * Create a new PO
   */
  async createPurchaseOrder(req, res, next) {
    try {
      const validated = await purchaseOrderSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const po = await procurementService.createPurchaseOrder(validated.value, req.user.id);

      return successResponse(res, po, 'Purchase order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/purchase-orders
   * List POs
   */
  async listPurchaseOrders(req, res, next) {
    try {
      const { status, supplierId, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
      
      const filters = {
        status,
        supplierId: supplierId ? parseInt(supplierId) : undefined,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await procurementService.listPurchaseOrders(filters);

      return successResponse(res, result, 'Purchase orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/purchase-orders/:id
   * PO details
   */
  async getPurchaseOrder(req, res, next) {
    try {
      const poId = parseInt(req.params.id);
      
      if (isNaN(poId)) {
        return errorResponse(res, 'Invalid purchase order ID', 'INVALID_ID', 400);
      }

      const po = await procurementService.getPurchaseOrderById(poId);

      return successResponse(res, po, 'Purchase order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/purchase-orders/:id
   * Update PO (only if DRAFT)
   */
  async updatePurchaseOrder(req, res, next) {
    try {
      const poId = parseInt(req.params.id);
      
      if (isNaN(poId)) {
        return errorResponse(res, 'Invalid purchase order ID', 'INVALID_ID', 400);
      }

      const validated = await purchaseOrderSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const po = await procurementService.updatePurchaseOrder(poId, validated.value);

      return successResponse(res, po, 'Purchase order updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/purchase-orders/:id/submit
   * Submit for approval
   */
  async submitPurchaseOrder(req, res, next) {
    try {
      const poId = parseInt(req.params.id);
      
      if (isNaN(poId)) {
        return errorResponse(res, 'Invalid purchase order ID', 'INVALID_ID', 400);
      }

      const po = await procurementService.submitPurchaseOrder(poId, req.user.id);

      return successResponse(res, po, 'Purchase order submitted for approval successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/purchase-orders/:id/allocate-forex
   * Allocate forex to this PO
   */
  async allocateForex(req, res, next) {
    try {
      const poId = parseInt(req.params.id);
      
      if (isNaN(poId)) {
        return errorResponse(res, 'Invalid purchase order ID', 'INVALID_ID', 400);
      }

      const validated = await forexAllocationSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const allocation = await procurementService.allocateForex(poId, validated.value, req.user.id);

      return successResponse(res, allocation, 'Forex allocated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/forex-rates
   * List current forex rates
   */
  async listForexRates(req, res, next) {
    try {
      const { currency } = req.query;

      const rates = await procurementService.listForexRates(currency);

      return successResponse(res, rates, 'Forex rates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/forex-rates
   * Add a new forex rate
   */
  async createForexRate(req, res, next) {
    try {
      const validated = await forexRateSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const rate = await procurementService.createForexRate(validated.value, req.user.id);

      return successResponse(res, rate, 'Forex rate created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/purchase-orders/prioritize
   * Get prioritized PO list based on budget
   */
  async prioritizePurchaseOrders(req, res, next) {
    try {
      const { budget, currency } = req.query;

      if (!budget || !currency) {
        return errorResponse(res, 'budget and currency are required', 'MISSING_FIELDS', 400);
      }

      const result = await procurementService.prioritizePurchaseOrders(
        parseFloat(budget),
        currency.toUpperCase()
      );

      return successResponse(res, result, 'Prioritized purchase orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProcurementController();
module.exports.supplierSchema = supplierSchema;
module.exports.purchaseOrderSchema = purchaseOrderSchema;
module.exports.forexAllocationSchema = forexAllocationSchema;
module.exports.forexRateSchema = forexRateSchema;
module.exports.supplierRatingSchema = supplierRatingSchema;
