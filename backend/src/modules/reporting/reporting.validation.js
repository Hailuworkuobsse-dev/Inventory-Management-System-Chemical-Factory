const Joi = require('joi');

const createReportSchema = Joi.object({
  type: Joi.string().valid('INVENTORY_VALUATION', 'STOCK_MOVEMENT', 'SALES_ANALYSIS', 'PURCHASE_ANALYSIS', 'ABC_ANALYSIS').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  warehouseId: Joi.string().uuid().optional(),
  itemId: Joi.string().uuid().optional(),
  format: Joi.string().valid('JSON', 'CSV', 'PDF').default('JSON')
});

const getDashboardMetricsSchema = Joi.object({
  warehouseId: Joi.string().uuid().optional(),
  includeTrends: Joi.boolean().default(true),
  daysBack: Joi.number().integer().min(1).max(365).default(30)
});

module.exports = {
  createReportSchema,
  getDashboardMetricsSchema
};
