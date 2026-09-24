const Joi = require('joi');

const salesValidation = {
  createSalesOrder: Joi.object({
    customerId: Joi.number().required(),
    warehouseId: Joi.number().required(),
    requiredDate: Joi.date().optional(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).optional()
      })
    ).min(1).required()
  }),

  updateSalesOrderStatus: Joi.object({
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'PICKING', 'PICKED', 'PACKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED').required(),
    trackingNumber: Joi.string().optional()
  }),

  createReturn: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().required(),
        batchId: Joi.number().optional(),
        quantity: Joi.number().min(1).required(),
        reason: Joi.string().optional()
      })
    ).min(1).required()
  }),

  updateReturnDisposition: Joi.object({
    items: Joi.array().items(
      Joi.object({
        returnItemId: Joi.number().required(),
        disposition: Joi.string().valid('RESTOCK', 'SCRAP', 'QUARANTINE', 'RETURN_TO_VENDOR').required()
      })
    ).min(1).required()
  })
};

module.exports = salesValidation;