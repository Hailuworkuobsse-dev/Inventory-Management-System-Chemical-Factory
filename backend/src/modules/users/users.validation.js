const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  roleId: Joi.string().uuid().required(),
  phone: Joi.string().optional(),
  isActive: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  roleId: Joi.string().uuid().optional(),
  isActive: Joi.boolean().optional()
});

const createRoleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  permissions: Joi.array().items(Joi.string()).optional()
});

const assignPermissionsSchema = Joi.object({
  roleId: Joi.string().uuid().required(),
  permissions: Joi.array().items(Joi.string()).required()
});

const getUserPermissionsSchema = Joi.object({
  userId: Joi.string().uuid().required()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  createRoleSchema,
  assignPermissionsSchema,
  getUserPermissionsSchema
};
