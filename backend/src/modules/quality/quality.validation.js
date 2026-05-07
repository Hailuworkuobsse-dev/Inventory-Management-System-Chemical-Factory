const Joi = require('joi');

const updateBatchStatusSchema = Joi.object({
  batchId: Joi.string().uuid().required(),
  status: Joi.string().valid('ACTIVE', 'QUARANTINE', 'REJECTED', 'EXPIRED', 'RECALLED').required(),
  reason: Joi.string().optional()
});

const createLabTestSchema = Joi.object({
  batchId: Joi.string().uuid().required(),
  testType: Joi.string().required(),
  parameters: Joi.object().optional(),
  result: Joi.string().valid('PASS', 'FAIL', 'PENDING').default('PENDING'),
  notes: Joi.string().optional()
});

const quarantineBatchSchema = Joi.object({
  batchId: Joi.string().uuid().required(),
  reason: Joi.string().required(),
  expiryDate: Joi.date().optional()
});

const initiateRecallSchema = Joi.object({
  batchId: Joi.string().uuid().required(),
  reason: Joi.string().required(),
  severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').required(),
  affectedRegions: Joi.array().items(Joi.string()).optional()
});

const createEUDRComplianceSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  batchId: Joi.string().uuid().required(),
  geolocation: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required()
  }).required(),
  harvestDate: Joi.date().required(),
  supplierDeclaration: Joi.boolean().required()
});

module.exports = {
  updateBatchStatusSchema,
  createLabTestSchema,
  quarantineBatchSchema,
  initiateRecallSchema,
  createEUDRComplianceSchema
};
