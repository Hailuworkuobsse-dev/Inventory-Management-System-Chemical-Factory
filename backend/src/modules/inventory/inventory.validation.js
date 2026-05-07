const Joi = require('joi');

const goodsReceiptSchema = Joi.object({
  warehouseId: Joi.string().uuid().required(),
  supplierId: Joi.string().uuid().required(),
  poNumber: Joi.string().optional(),
  items: Joi.array().items(
    Joi.object({
      itemId: Joi.string().uuid().required(),
      quantity: Joi.number().positive().required(),
      costPrice: Joi.number().positive().required(),
      manufacturingDate: Joi.date().optional(),
      expiresAt: Joi.date().greater('now').optional()
    })
  ).min(1).required(),
  qualityStatus: Joi.string().valid('PENDING', 'ACCEPTED', 'REJECTED').default('PENDING')
});

const stockTransferSchema = Joi.object({
  fromWarehouseId: Joi.string().uuid().required(),
  toWarehouseId: Joi.string().uuid().required().different('fromWarehouseId'),
  items: Joi.array().items(
    Joi.object({
      itemId: Joi.string().uuid().required(),
      batchId: Joi.string().uuid().required(),
      quantity: Joi.number().positive().required()
    })
  ).min(1).required()
});

const receiveTransferSchema = Joi.object({
  transferId: Joi.string().uuid().required()
});

const adjustStockSchema = Joi.object({
  warehouseId: Joi.string().uuid().required(),
  itemId: Joi.string().uuid().required(),
  batchId: Joi.string().uuid().optional(),
  quantity: Joi.number().required(), // Positive for add, negative for deduct
  reason: Joi.string().required(),
  notes: Joi.string().optional()
});

const getStockLevelsSchema = Joi.object({
  warehouseId: Joi.string().uuid().optional(),
  itemId: Joi.string().uuid().optional(),
  batchId: Joi.string().uuid().optional()
});

module.exports = {
  goodsReceiptSchema,
  stockTransferSchema,
  receiveTransferSchema,
  adjustStockSchema,
  getStockLevelsSchema
};
