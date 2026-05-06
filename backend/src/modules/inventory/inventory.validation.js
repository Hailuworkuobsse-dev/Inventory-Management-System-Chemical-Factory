const Joi = require('joi');

const receiptSchema = Joi.object({
  warehouseId: Joi.number().required(),
  purchaseOrderId: Joi.number().optional(),
  iImportPermit: Joi.string().optional(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().required(),
      batchNumber: Joi.string().required(),
      manufactureDate: Joi.date().required(),
      expiryDate: Joi.date().min(Joi.ref('manufactureDate')).required(),
      quantity: Joi.number().positive().required(),
      unitCost: Joi.number().positive().required(),
      currency: Joi.string().default('USD'),
      labTestRequired: Joi.boolean().default(false)
    })
  ).required()
});

const acceptReceiptSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      receiptItemId: Joi.number().required(),
      quantityAccepted: Joi.number().positive().required()
    })
  ).required()
});

const transferStockSchema = Joi.object({
  fromStockId: Joi.number().required(),
  toWarehouseId: Joi.number().required(),
  toBinLabel: Joi.string().optional(),
  quantity: Joi.number().positive().required(),
  reason: Joi.string().optional()
});

const adjustStockSchema = Joi.object({
  stockId: Joi.number().required(),
  adjustedQuantity: Joi.number().min(0).required(),
  reason: Joi.string().required()
});

const disposeStockSchema = Joi.object({
  stockId: Joi.number().required(),
  quantity: Joi.number().positive().required(),
  disposalMethod: Joi.string().valid('INCINERATION', 'LANDFILL', 'RETURN_TO_SUPPLIER', 'OTHER').required()
});

const reserveStockSchema = Joi.object({
  warehouseId: Joi.number().required(),
  productId: Joi.number().required(),
  quantity: Joi.number().positive().required(),
  orderReference: Joi.string().optional()
});

module.exports = {
  receiptSchema,
  acceptReceiptSchema,
  transferStockSchema,
  adjustStockSchema,
  disposeStockSchema,
  reserveStockSchema
};
