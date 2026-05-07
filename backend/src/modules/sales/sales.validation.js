const Joi = require('joi');

const createSalesOrderSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  warehouseId: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      itemId: Joi.string().uuid().required(),
      quantity: Joi.number().positive().required()
    })
  ).min(1).required(),
  priority: Joi.string().valid('NORMAL', 'EXPRESS').default('NORMAL'),
  notes: Joi.string().optional()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED').required()
});

const createReturnSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      itemId: Joi.string().uuid().required(),
      quantity: Joi.number().positive().required(),
      reason: Joi.string().required()
    })
  ).min(1).required(),
  returnReason: Joi.string().required(),
  notes: Joi.string().optional()
});

const createCustomerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  taxId: Joi.string().optional(),
  creditLimit: Joi.number().nonNegative().optional()
});

module.exports = {
  createSalesOrderSchema,
  updateOrderStatusSchema,
  createReturnSchema,
  createCustomerSchema
};
