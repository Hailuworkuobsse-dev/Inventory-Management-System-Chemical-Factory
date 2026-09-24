const Joi = require('joi');

const procurementValidation = {
  createSupplier: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    country: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    isCertified: Joi.boolean().optional(),
    certificateExpiryDate: Joi.date().optional()
  }),

  updateSupplier: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    country: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    isCertified: Joi.boolean().optional(),
    certificateExpiryDate: Joi.date().optional()
  }),

  createPurchaseOrder: Joi.object({
    supplierId: Joi.number().required(),
    currency: Joi.string().length(3).optional(),
    lcId: Joi.string().optional(),
    expectedDate: Joi.date().optional(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required()
      })
    ).min(1).required()
  }),

  updatePurchaseOrder: Joi.object({
    supplierId: Joi.number().optional(),
    currency: Joi.string().length(3).optional(),
    expectedDate: Joi.date().optional(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required()
      })
    ).optional()
  }),

  allocateForex: Joi.object({
    allocatedAmount: Joi.number().min(0.01).required(),
    rate: Joi.number().min(0.01).required()
  }),

  createForexRate: Joi.object({
    currency: Joi.string().length(3).required(),
    rateToETB: Joi.number().min(0.01).required(),
    source: Joi.string().optional(),
    effectiveDate: Joi.date().optional()
  })
};

module.exports = procurementValidation;