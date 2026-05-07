const Joi = require('joi');

const createBOMSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  version: Joi.string().default('1.0'),
  items: Joi.array().items(
    Joi.object({
      itemId: Joi.string().uuid().required(),
      quantity: Joi.number().positive().required(),
      unitOfMeasure: Joi.string().required()
    })
  ).min(1).required()
});

const createWorkOrderSchema = Joi.object({
  bomId: Joi.string().uuid().required(),
  productionLineId: Joi.string().uuid().optional(),
  plannedQuantity: Joi.number().positive().required(),
  scheduledStartDate: Joi.date().greater('now').required(),
  scheduledEndDate: Joi.date().greater(Joi.ref('scheduledStartDate')).required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM')
});

const recordProductionOutputSchema = Joi.object({
  workOrderId: Joi.string().uuid().required(),
  goodQuantity: Joi.number().nonNegative().required(),
  wasteQuantity: Joi.number().nonNegative().default(0),
  batchNumber: Joi.string().optional(),
  notes: Joi.string().optional()
});

const updateWorkOrderStatusSchema = Joi.object({
  status: Joi.string().valid('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').required()
});

module.exports = {
  createBOMSchema,
  createWorkOrderSchema,
  recordProductionOutputSchema,
  updateWorkOrderStatusSchema
};
