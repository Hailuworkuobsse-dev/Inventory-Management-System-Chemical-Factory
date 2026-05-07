const complianceService = require('./compliance.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas
const exportErisSchema = async (data) => {
  const errors = [];
  const value = {};

  if (data.dateRange && Array.isArray(data.dateRange) && data.dateRange.length === 2) {
    const startDate = new Date(data.dateRange[0]);
    const endDate = new Date(data.dateRange[1]);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push({ message: 'dateRange must contain valid dates', path: ['dateRange'] });
    } else {
      value.dateRange = [startDate, endDate];
    }
  }

  value.format = data.format || 'JSON';

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const exportTaxSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.periodStart) {
    errors.push({ message: 'periodStart is required', path: ['periodStart'] });
  } else {
    const startDate = new Date(data.periodStart);
    if (isNaN(startDate.getTime())) {
      errors.push({ message: 'periodStart must be a valid date', path: ['periodStart'] });
    } else {
      value.periodStart = startDate;
    }
  }

  if (!data.periodEnd) {
    errors.push({ message: 'periodEnd is required', path: ['periodEnd'] });
  } else {
    const endDate = new Date(data.periodEnd);
    if (isNaN(endDate.getTime())) {
      errors.push({ message: 'periodEnd must be a valid date', path: ['periodEnd'] });
    } else {
      value.periodEnd = endDate;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const exportAuditSchema = async (data) => {
  const errors = [];
  const value = {};

  if (data.warehouseId) {
    const warehouseId = parseInt(data.warehouseId);
    if (isNaN(warehouseId)) {
      errors.push({ message: 'warehouseId must be a number', path: ['warehouseId'] });
    } else {
      value.warehouseId = warehouseId;
    }
  }

  if (data.date) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'date must be a valid date', path: ['date'] });
    } else {
      value.date = date;
    }
  } else {
    value.date = new Date();
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * Compliance Controller
 * Handles regulatory exports (eRIS, tax, audit), EUDR documentation, and compliance reports
 */
class ComplianceController {
  /**
   * POST /api/v1/regulatory/export-eris
   * Generate eRIS data file
   */
  async exportEris(req, res, next) {
    try {
      const validated = await exportErisSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await complianceService.exportEris(validated.value, req.user.id);

      return successResponse(res, result, 'eRIS export generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/regulatory/export-tax
   * Export tax valuation report
   */
  async exportTax(req, res, next) {
    try {
      const validated = await exportTaxSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await complianceService.exportTax(validated.value, req.user.id);

      return successResponse(res, result, 'Tax export generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/regulatory/export-audit
   * Instant inspection report
   */
  async exportAudit(req, res, next) {
    try {
      const validated = await exportAuditSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await complianceService.exportAudit(validated.value, req.user.id);

      return successResponse(res, result, 'Audit report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/regulatory/export-history
   * List previous exports
   */
  async getExportHistory(req, res, next) {
    try {
      const { type, date, page = 1, limit = 50 } = req.query;
      
      const filters = {
        type,
        date: date ? new Date(date) : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await complianceService.getExportHistory(filters);

      return successResponse(res, result, 'Export history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/audit-logs
   * List audit trail entries
   */
  async listAuditLogs(req, res, next) {
    try {
      const { entity, entityId, userId, from, to, page = 1, limit = 50 } = req.query;
      
      const filters = {
        entity,
        entityId: entityId ? parseInt(entityId) : undefined,
        userId: userId ? parseInt(userId) : undefined,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await complianceService.listAuditLogs(filters);

      return successResponse(res, result, 'Audit logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/audit-logs/:id
   * Single audit log detail
   */
  async getAuditLog(req, res, next) {
    try {
      const auditLogId = parseInt(req.params.id);
      
      if (isNaN(auditLogId)) {
        return errorResponse(res, 'Invalid audit log ID', 'INVALID_ID', 400);
      }

      const auditLog = await complianceService.getAuditLogById(auditLogId);

      return successResponse(res, auditLog, 'Audit log retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/batch-events
   * List all batch events
   */
  async listBatchEvents(req, res, next) {
    try {
      const { batchId, type, from, to, page = 1, limit = 50 } = req.query;
      
      const filters = {
        batchId: batchId ? parseInt(batchId) : undefined,
        type,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await complianceService.listBatchEvents(filters);

      return successResponse(res, result, 'Batch events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/batch-events/:id
   * Single event detail (with hash)
   */
  async getBatchEvent(req, res, next) {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return errorResponse(res, 'Invalid event ID', 'INVALID_ID', 400);
      }

      const event = await complianceService.getBatchEventById(eventId);

      return successResponse(res, event, 'Batch event retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ComplianceController();
module.exports.exportErisSchema = exportErisSchema;
module.exports.exportTaxSchema = exportTaxSchema;
module.exports.exportAuditSchema = exportAuditSchema;
