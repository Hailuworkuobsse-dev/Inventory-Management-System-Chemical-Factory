const qualityService = require('./quality.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas
const batchListSchema = async (query) => {
  const errors = [];
  const value = {};

  if (query.productId) {
    const productId = parseInt(query.productId);
    if (isNaN(productId)) {
      errors.push({ message: 'productId must be a number', path: ['productId'] });
    } else {
      value.productId = productId;
    }
  }

  if (query.status) {
    value.status = query.status.toUpperCase();
  }

  if (query.expiringWithinDays) {
    const days = parseInt(query.expiringWithinDays);
    if (isNaN(days) || days <= 0) {
      errors.push({ message: 'expiringWithinDays must be a positive number', path: ['expiringWithinDays'] });
    } else {
      value.expiringWithinDays = days;
    }
  }

  value.page = query.page ? parseInt(query.page) : 1;
  value.limit = query.limit ? parseInt(query.limit) : 50;

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const quarantineSchema = async (data) => {
  const errors = [];
  const value = {};

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

const releaseSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.testIds || !Array.isArray(data.testIds) || data.testIds.length === 0) {
    errors.push({ message: 'testIds array is required', path: ['testIds'] });
  } else {
    value.testIds = data.testIds.map(id => parseInt(id));
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const recallSchema = async (data) => {
  const errors = [];
  const value = {};

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

const labTestSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.testType) {
    errors.push({ message: 'testType is required', path: ['testType'] });
  } else {
    value.testType = data.testType;
  }

  if (!data.status) {
    errors.push({ message: 'status is required', path: ['status'] });
  } else {
    value.status = data.status.toUpperCase();
  }

  value.resultValue = data.resultValue || null;
  value.remarks = data.remarks || null;

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const eudrDocumentSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.certificateUrl) {
    errors.push({ message: 'certificateUrl is required', path: ['certificateUrl'] });
  } else {
    value.certificateUrl = data.certificateUrl;
  }

  value.geoCoordinates = data.geoCoordinates || null;
  value.deforestationRisk = data.deforestationRisk || null;

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * Quality Controller
 * Handles batch management, quality tests, quarantine, recalls, and compliance documentation
 */
class QualityController {
  /**
   * GET /api/v1/batches
   * List batches with filters
   */
  async listBatches(req, res, next) {
    try {
      const validated = await batchListSchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const result = await qualityService.listBatches(validated.value);

      return successResponse(res, result, 'Batches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/batches/:id
   * Batch details with traceability
   */
  async getBatch(req, res, next) {
    try {
      const batchId = parseInt(req.params.id);
      
      if (isNaN(batchId)) {
        return errorResponse(res, 'Invalid batch ID', 'INVALID_ID', 400);
      }

      const batch = await qualityService.getBatchById(batchId);

      return successResponse(res, batch, 'Batch retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/batches/:id/quarantine
   * Move batch to quarantine
   */
  async quarantineBatch(req, res, next) {
    try {
      const batchId = parseInt(req.params.id);
      
      if (isNaN(batchId)) {
        return errorResponse(res, 'Invalid batch ID', 'INVALID_ID', 400);
      }

      const validated = await quarantineSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const batch = await qualityService.quarantineBatch(batchId, validated.value.reason, req.user.id);

      return successResponse(res, batch, 'Batch moved to quarantine successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/batches/:id/release
   * Release batch from quarantine
   */
  async releaseBatch(req, res, next) {
    try {
      const batchId = parseInt(req.params.id);
      
      if (isNaN(batchId)) {
        return errorResponse(res, 'Invalid batch ID', 'INVALID_ID', 400);
      }

      const validated = await releaseSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const batch = await qualityService.releaseBatch(batchId, validated.value.testIds, req.user.id);

      return successResponse(res, batch, 'Batch released successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/batches/:id/recall
   * Initiate recall
   */
  async recallBatch(req, res, next) {
    try {
      const batchId = parseInt(req.params.id);
      
      if (isNaN(batchId)) {
        return errorResponse(res, 'Invalid batch ID', 'INVALID_ID', 400);
      }

      const validated = await recallSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const batch = await qualityService.recallBatch(batchId, validated.value.reason, req.user.id);

      return successResponse(res, batch, 'Batch recall initiated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/batches/:id/lab-tests
   * Add lab test result
   */
  async addLabTest(req, res, next) {
    try {
      const batchId = parseInt(req.params.id);
      
      if (isNaN(batchId)) {
        return errorResponse(res, 'Invalid batch ID', 'INVALID_ID', 400);
      }

      const validated = await labTestSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const labTest = await qualityService.addLabTest(batchId, validated.value, req.user.id);

      return successResponse(res, labTest, 'Lab test added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/batches/:id/eudr-document
   * Get deforestation-free document (if export)
   */
  async getEudrDocument(req, res, next) {
    try {
      const batchId = parseInt(req.params.id);
      
      if (isNaN(batchId)) {
        return errorResponse(res, 'Invalid batch ID', 'INVALID_ID', 400);
      }

      const document = await qualityService.getEudrDocument(batchId);

      if (!document) {
        return errorResponse(res, 'EUDR document not found for this batch', 'NOT_FOUND', 404);
      }

      return successResponse(res, document, 'EUDR document retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/batches/:id/eudr-document
   * Attach EUDR certificate
   */
  async createEudrDocument(req, res, next) {
    try {
      const batchId = parseInt(req.params.id);
      
      if (isNaN(batchId)) {
        return errorResponse(res, 'Invalid batch ID', 'INVALID_ID', 400);
      }

      const validated = await eudrDocumentSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const document = await qualityService.createEudrDocument(batchId, validated.value, req.user.id);

      return successResponse(res, document, 'EUDR document created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QualityController();
module.exports.batchListSchema = batchListSchema;
module.exports.quarantineSchema = quarantineSchema;
module.exports.releaseSchema = releaseSchema;
module.exports.recallSchema = recallSchema;
module.exports.labTestSchema = labTestSchema;
module.exports.eudrDocumentSchema = eudrDocumentSchema;
