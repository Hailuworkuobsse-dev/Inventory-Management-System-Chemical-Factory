const Joi = require('joi');

const generateErisExportSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  warehouseId: Joi.string().uuid().optional(),
  format: Joi.string().valid('XML', 'JSON', 'CSV').default('XML')
});

const generateEUDRReportSchema = Joi.object({
  productId: Joi.string().uuid().optional(),
  batchId: Joi.string().uuid().optional(),
  includeGeolocation: Joi.boolean().default(true)
});

const getAuditLogsSchema = Joi.object({
  entityType: Joi.string().optional(),
  entityId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),
  action: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100)
});

module.exports = {
  generateErisExportSchema,
  generateEUDRReportSchema,
  getAuditLogsSchema
};
