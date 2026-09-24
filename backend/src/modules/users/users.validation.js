const Joi = require('joi');

const usersValidation = {
  createUser: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    warehouseId: Joi.number().optional(),
    roleIds: Joi.array().items(Joi.number()).optional()
  }),

  updateUser: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).optional(),
    phone: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    warehouseId: Joi.number().optional()
  }),

  assignRole: Joi.object({
    roleId: Joi.number().required()
  }),

  removeRole: Joi.object({
    roleId: Joi.number().required()
  }),

  createRole: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    permissionIds: Joi.array().items(Joi.number()).optional()
  }),

  updateRole: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    permissionIds: Joi.array().items(Joi.number()).optional()
  })
};

module.exports = usersValidation;