const Joi = require('joi');

const createAlertSchema = Joi.object({
  type: Joi.string().valid('STOCK_LOW', 'STOCK_OUT', 'EXPIRY_WARNING', 'BATCH_EXPIRED', 'QUALITY_ISSUE', 'IOT_ALERT').required(),
  severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').required(),
  title: Joi.string().required(),
  message: Joi.string().required(),
  entityId: Joi.string().uuid().optional(),
  entityType: Joi.string().optional(),
  warehouseId: Joi.string().uuid().optional()
});

const updateAlertStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_ALARM').required(),
  resolutionNotes: Joi.string().optional()
});

const createAlertThresholdSchema = Joi.object({
  metricType: Joi.string().valid('STOCK_LEVEL', 'TEMPERATURE', 'HUMIDITY', 'DAYS_TO_EXPIRY').required(),
  thresholdType: Joi.string().valid('MIN', 'MAX').required(),
  value: Joi.number().required(),
  itemId: Joi.string().uuid().optional(),
  warehouseId: Joi.string().uuid().optional(),
  alertSeverity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').default('MEDIUM')
});

module.exports = {
  createAlertSchema,
  updateAlertStatusSchema,
  createAlertThresholdSchema
};
