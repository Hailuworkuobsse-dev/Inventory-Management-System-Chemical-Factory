const alertsService = require('./alerts.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas
const alertThresholdSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.productId) {
    errors.push({ message: 'productId is required', path: ['productId'] });
  } else {
    value.productId = parseInt(data.productId);
  }

  if (!data.alertType) {
    errors.push({ message: 'alertType is required', path: ['alertType'] });
  } else {
    value.alertType = data.alertType.toUpperCase(); // EXPIRY, STOCK_OUT, QUALITY
  }

  if (data.daysBeforeExpiry !== undefined) {
    const days = parseInt(data.daysBeforeExpiry);
    if (isNaN(days) || days <= 0) {
      errors.push({ message: 'daysBeforeExpiry must be a positive number', path: ['daysBeforeExpiry'] });
    } else {
      value.daysBeforeExpiry = days;
    }
  }

  if (data.minStockLevel !== undefined) {
    const level = parseFloat(data.minStockLevel);
    if (isNaN(level) || level < 0) {
      errors.push({ message: 'minStockLevel must be non-negative', path: ['minStockLevel'] });
    } else {
      value.minStockLevel = level;
    }
  }

  if (data.notifyRoles && Array.isArray(data.notifyRoles)) {
    value.notifyRoles = data.notifyRoles.map(r => parseInt(r));
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const alertsQuerySchema = async (query) => {
  const errors = [];
  const value = {};

  if (query.acknowledged !== undefined) {
    value.acknowledged = query.acknowledged === 'true';
  }

  if (query.type) {
    value.type = query.type.toUpperCase();
  }

  if (query.from) {
    const date = new Date(query.from);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'from must be a valid date', path: ['from'] });
    } else {
      value.from = date;
    }
  }

  if (query.to) {
    const date = new Date(query.to);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'to must be a valid date', path: ['to'] });
    } else {
      value.to = date;
    }
  }

  if (query.page) {
    value.page = parseInt(query.page);
  }

  if (query.limit) {
    value.limit = parseInt(query.limit);
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * Alerts Controller
 * Handles alert history, threshold configuration, and alert management
 */
class AlertsController {
  /**
   * GET /api/v1/alerts
   * List active alerts
   */
  async listAlerts(req, res, next) {
    try {
      const validated = await alertsQuerySchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await alertsService.listAlerts(validated.value);

      return successResponse(res, result, 'Alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/alerts/:id/acknowledge
   * Acknowledge an alert
   */
  async acknowledgeAlert(req, res, next) {
    try {
      const alertId = parseInt(req.params.id);
      
      if (isNaN(alertId)) {
        return errorResponse(res, 'Invalid alert ID', 'INVALID_ID', 400);
      }

      const alert = await alertsService.acknowledgeAlert(alertId, req.user.id);

      return successResponse(res, alert, 'Alert acknowledged successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/alert-thresholds
   * Get product alert thresholds
   */
  async listAlertThresholds(req, res, next) {
    try {
      const { productId } = req.query;
      
      const filters = {
        productId: productId ? parseInt(productId) : undefined,
      };

      const thresholds = await alertsService.listAlertThresholds(filters);

      return successResponse(res, thresholds, 'Alert thresholds retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/alert-thresholds
   * Set a new threshold
   */
  async createAlertThreshold(req, res, next) {
    try {
      const validated = await alertThresholdSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const threshold = await alertsService.createAlertThreshold(validated.value, req.user.id);

      return successResponse(res, threshold, 'Alert threshold created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/alert-thresholds/:id
   * Update threshold
   */
  async updateAlertThreshold(req, res, next) {
    try {
      const thresholdId = parseInt(req.params.id);
      
      if (isNaN(thresholdId)) {
        return errorResponse(res, 'Invalid threshold ID', 'INVALID_ID', 400);
      }

      const validated = await alertThresholdSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const threshold = await alertsService.updateAlertThreshold(thresholdId, validated.value, req.user.id);

      return successResponse(res, threshold, 'Alert threshold updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/alert-thresholds/:id
   * Remove threshold
   */
  async deleteAlertThreshold(req, res, next) {
    try {
      const thresholdId = parseInt(req.params.id);
      
      if (isNaN(thresholdId)) {
        return errorResponse(res, 'Invalid threshold ID', 'INVALID_ID', 400);
      }

      await alertsService.deleteAlertThreshold(thresholdId, req.user.id);

      return successResponse(res, null, 'Alert threshold deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertsController();
module.exports.alertThresholdSchema = alertThresholdSchema;
module.exports.alertsQuerySchema = alertsQuerySchema;
