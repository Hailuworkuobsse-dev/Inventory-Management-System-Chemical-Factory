const productionService = require('./production.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas
const bomSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.productId) {
    errors.push({ message: 'productId is required', path: ['productId'] });
  } else {
    value.productId = parseInt(data.productId);
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push({ message: 'At least one BOM item is required', path: ['items'] });
  } else {
    value.items = data.items.map((item, index) => {
      const itemErrors = [];
      const itemValue = {};

      if (!item.componentProductId) {
        itemErrors.push({ message: 'componentProductId is required', path: ['items', index, 'componentProductId'] });
      } else {
        itemValue.componentProductId = parseInt(item.componentProductId);
      }

      if (!item.quantityPerUnit || item.quantityPerUnit <= 0) {
        itemErrors.push({ message: 'quantityPerUnit must be positive', path: ['items', index, 'quantityPerUnit'] });
      } else {
        itemValue.quantityPerUnit = parseFloat(item.quantityPerUnit);
      }

      itemValue.scrapFactor = item.scrapFactor ? parseFloat(item.scrapFactor) : 0;

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

const workOrderSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.productId) {
    errors.push({ message: 'productId is required', path: ['productId'] });
  } else {
    value.productId = parseInt(data.productId);
  }

  if (!data.bomId) {
    errors.push({ message: 'bomId is required', path: ['bomId'] });
  } else {
    value.bomId = parseInt(data.bomId);
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push({ message: 'quantity must be positive', path: ['quantity'] });
  } else {
    value.quantity = parseFloat(data.quantity);
  }

  if (data.startDate) {
    const date = new Date(data.startDate);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'startDate must be a valid date', path: ['startDate'] });
    } else {
      value.startDate = date;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const materialsConsumptionSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.materials || !Array.isArray(data.materials) || data.materials.length === 0) {
    errors.push({ message: 'At least one material is required', path: ['materials'] });
  } else {
    value.materials = data.materials.map((item, index) => {
      const itemErrors = [];
      const itemValue = {};

      if (!item.productId) {
        itemErrors.push({ message: 'productId is required', path: ['materials', index, 'productId'] });
      } else {
        itemValue.productId = parseInt(item.productId);
      }

      if (item.batchId) {
        itemValue.batchId = parseInt(item.batchId);
      }

      if (!item.consumedQty || item.consumedQty <= 0) {
        itemErrors.push({ message: 'consumedQty must be positive', path: ['materials', index, 'consumedQty'] });
      } else {
        itemValue.consumedQty = parseFloat(item.consumedQty);
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

const completeWorkOrderSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.batchNumber) {
    errors.push({ message: 'batchNumber is required', path: ['batchNumber'] });
  } else {
    value.batchNumber = data.batchNumber;
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push({ message: 'quantity must be positive', path: ['quantity'] });
  } else {
    value.quantity = parseFloat(data.quantity);
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * Production Controller
 * Handles BOM management, work orders, and yield analysis
 */
class ProductionController {
  /**
   * POST /api/v1/boms
   * Create a Bill of Materials
   */
  async createBom(req, res, next) {
    try {
      const validated = await bomSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const bom = await productionService.createBom(validated.value, req.user.id);

      return successResponse(res, bom, 'BOM created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/boms
   * List BOMs for a product
   */
  async listBoms(req, res, next) {
    try {
      const { productId, activeOnly } = req.query;

      if (!productId) {
        return errorResponse(res, 'productId query parameter is required', 'MISSING_FIELD', 400);
      }

      const boms = await productionService.listBoms(parseInt(productId), activeOnly === 'true');

      return successResponse(res, boms, 'BOMs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/boms/:id
   * Update BOM (creates new version)
   */
  async updateBom(req, res, next) {
    try {
      const bomId = parseInt(req.params.id);
      
      if (isNaN(bomId)) {
        return errorResponse(res, 'Invalid BOM ID', 'INVALID_ID', 400);
      }

      const validated = await bomSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const bom = await productionService.updateBom(bomId, validated.value, req.user.id);

      return successResponse(res, bom, 'BOM updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/work-orders
   * Create a work order
   */
  async createWorkOrder(req, res, next) {
    try {
      const validated = await workOrderSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const wo = await productionService.createWorkOrder(validated.value, req.user.id);

      return successResponse(res, wo, 'Work order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/work-orders
   * List work orders
   */
  async listWorkOrders(req, res, next) {
    try {
      const { status, productId, page = 1, limit = 50 } = req.query;
      
      const filters = {
        status,
        productId: productId ? parseInt(productId) : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await productionService.listWorkOrders(filters);

      return successResponse(res, result, 'Work orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/work-orders/:id/materials
   * Record material consumption
   */
  async recordMaterials(req, res, next) {
    try {
      const woId = parseInt(req.params.id);
      
      if (isNaN(woId)) {
        return errorResponse(res, 'Invalid work order ID', 'INVALID_ID', 400);
      }

      const validated = await materialsConsumptionSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const wo = await productionService.recordMaterials(woId, validated.value.materials, req.user.id);

      return successResponse(res, wo, 'Materials recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/work-orders/:id/complete
   * Complete work order (output batch)
   */
  async completeWorkOrder(req, res, next) {
    try {
      const woId = parseInt(req.params.id);
      
      if (isNaN(woId)) {
        return errorResponse(res, 'Invalid work order ID', 'INVALID_ID', 400);
      }

      const validated = await completeWorkOrderSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const wo = await productionService.completeWorkOrder(woId, validated.value, req.user.id);

      return successResponse(res, wo, 'Work order completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/work-orders/:id/yield
   * Yield analysis
   */
  async getYieldAnalysis(req, res, next) {
    try {
      const woId = parseInt(req.params.id);
      
      if (isNaN(woId)) {
        return errorResponse(res, 'Invalid work order ID', 'INVALID_ID', 400);
      }

      const yieldData = await productionService.getYieldAnalysis(woId);

      return successResponse(res, yieldData, 'Yield analysis retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductionController();
module.exports.bomSchema = bomSchema;
module.exports.workOrderSchema = workOrderSchema;
module.exports.materialsConsumptionSchema = materialsConsumptionSchema;
module.exports.completeWorkOrderSchema = completeWorkOrderSchema;
