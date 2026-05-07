const reportingService = require('./reporting.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas for reports
const dateRangeSchema = async (query) => {
  const errors = [];
  const value = {};

  if (query.dateFrom) {
    const date = new Date(query.dateFrom);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'dateFrom must be a valid date', path: ['dateFrom'] });
    } else {
      value.dateFrom = date;
    }
  }

  if (query.dateTo) {
    const date = new Date(query.dateTo);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'dateTo must be a valid date', path: ['dateTo'] });
    } else {
      value.dateTo = date;
    }
  }

  if (query.warehouseId) {
    const warehouseId = parseInt(query.warehouseId);
    if (isNaN(warehouseId)) {
      errors.push({ message: 'warehouseId must be a number', path: ['warehouseId'] });
    } else {
      value.warehouseId = warehouseId;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const abcAnalysisSchema = async (query) => {
  const errors = [];
  const value = {};

  if (query.dateFrom) {
    const date = new Date(query.dateFrom);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'dateFrom must be a valid date', path: ['dateFrom'] });
    } else {
      value.dateFrom = date;
    }
  }

  if (query.dateTo) {
    const date = new Date(query.dateTo);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'dateTo must be a valid date', path: ['dateTo'] });
    } else {
      value.dateTo = date;
    }
  }

  if (query.warehouseId) {
    const warehouseId = parseInt(query.warehouseId);
    if (isNaN(warehouseId)) {
      errors.push({ message: 'warehouseId must be a number', path: ['warehouseId'] });
    } else {
      value.warehouseId = warehouseId;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const expiryNearingSchema = async (query) => {
  const errors = [];
  const value = {};

  if (!query.days) {
    value.days = 30; // Default to 30 days
  } else {
    const days = parseInt(query.days);
    if (isNaN(days) || days <= 0) {
      errors.push({ message: 'days must be a positive number', path: ['days'] });
    } else {
      value.days = days;
    }
  }

  if (query.warehouseId) {
    const warehouseId = parseInt(query.warehouseId);
    if (isNaN(warehouseId)) {
      errors.push({ message: 'warehouseId must be a number', path: ['warehouseId'] });
    } else {
      value.warehouseId = warehouseId;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const stockOutRiskSchema = async (query) => {
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

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const demandForecastSchema = async (query) => {
  const errors = [];
  const value = {};

  if (!query.productId) {
    errors.push({ message: 'productId is required', path: ['productId'] });
  } else {
    const productId = parseInt(query.productId);
    if (isNaN(productId)) {
      errors.push({ message: 'productId must be a number', path: ['productId'] });
    } else {
      value.productId = productId;
    }
  }

  if (query.months) {
    const months = parseInt(query.months);
    if (isNaN(months) || months <= 0 || months > 24) {
      errors.push({ message: 'months must be between 1 and 24', path: ['months'] });
    } else {
      value.months = months;
    }
  } else {
    value.months = 12;
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * Reporting Controller
 * Handles dashboards, analytics reports (ABC, turnover, shrinkage, forecasts), and KPIs
 */
class ReportingController {
  /**
   * GET /api/v1/reports/abc-analysis
   * ABC classification based on consumption value
   */
  async getAbcAnalysis(req, res, next) {
    try {
      const validated = await abcAnalysisSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await reportingService.getAbcAnalysis(validated.value);

      return successResponse(res, result, 'ABC analysis retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/inventory-turnover
   * Turnover ratio per product/warehouse
   */
  async getInventoryTurnover(req, res, next) {
    try {
      const validated = await dateRangeSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await reportingService.getInventoryTurnover(validated.value);

      return successResponse(res, result, 'Inventory turnover report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/slow-movers
   * Items below turnover threshold
   */
  async getSlowMovers(req, res, next) {
    try {
      const validated = await dateRangeSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await reportingService.getSlowMovers(validated.value);

      return successResponse(res, result, 'Slow movers report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/stock-valuation
   * Total stock value (FIFO or WA)
   */
  async getStockValuation(req, res, next) {
    try {
      const { method } = req.query;
      const validated = await dateRangeSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      validated.value.method = method || 'FIFO';

      const result = await reportingService.getStockValuation(validated.value);

      return successResponse(res, result, 'Stock valuation report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/expiry-nearing
   * Batches expiring within N days
   */
  async getExpiryNearing(req, res, next) {
    try {
      const validated = await expiryNearingSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await reportingService.getExpiryNearing(validated.value);

      return successResponse(res, result, 'Expiry nearing report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/stock-out-risk
   * Products below safety stock
   */
  async getStockOutRisk(req, res, next) {
    try {
      const validated = await stockOutRiskSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await reportingService.getStockOutRisk(validated.value);

      return successResponse(res, result, 'Stock out risk report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/shrinkage
   * Shrinkage comparison
   */
  async getShrinkageReport(req, res, next) {
    try {
      const validated = await dateRangeSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await reportingService.getShrinkageReport(validated.value);

      return successResponse(res, result, 'Shrinkage report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/demand-forecast
   * Seasonal demand patterns
   */
  async getDemandForecast(req, res, next) {
    try {
      const validated = await demandForecastSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await reportingService.getDemandForecast(validated.value);

      return successResponse(res, result, 'Demand forecast retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboards/executive
   * KPIs: total stock value, days of cover, non-moving stock, compliance alerts
   */
  async getExecutiveDashboard(req, res, next) {
    try {
      const { warehouseId } = req.query;
      
      const filters = {
        warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      };

      const result = await reportingService.getExecutiveDashboard(filters);

      return successResponse(res, result, 'Executive dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportingController();
module.exports.dateRangeSchema = dateRangeSchema;
module.exports.abcAnalysisSchema = abcAnalysisSchema;
module.exports.expiryNearingSchema = expiryNearingSchema;
module.exports.stockOutRiskSchema = stockOutRiskSchema;
module.exports.demandForecastSchema = demandForecastSchema;
