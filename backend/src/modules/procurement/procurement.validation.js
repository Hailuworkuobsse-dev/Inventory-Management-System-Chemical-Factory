const Joi = require('joi');

const createSupplierSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  taxId: Joi.string().optional(),
  currency: Joi.string().default('USD')
});

const createPurchaseOrderSchema = Joi.object({
  supplierId: Joi.string().uuid().required(),
  warehouseId: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      itemId: Joi.string().uuid().required(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().positive().required(),
      currency: Joi.string().default('USD')
    })
  ).min(1).required(),
  expectedDeliveryDate: Joi.date().greater('now').required(),
  notes: Joi.string().optional()
});

const updatePOStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_RECEIVED', 'COMPLETED').required()
});

const recordForexAllocationSchema = Joi.object({
  poId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().required(),
  exchangeRate: Joi.number().positive().required(),
  allocationDate: Joi.date().iso().optional()
});

const getForexRatesSchema = Joi.object({
  baseCurrency: Joi.string().default('USD'),
  targetCurrency: Joi.string().required()
});

module.exports = {
  createSupplierSchema,
  createPurchaseOrderSchema,
  updatePOStatusSchema,
  recordForexAllocationSchema,
  getForexRatesSchema
};
