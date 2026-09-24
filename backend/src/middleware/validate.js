const AppError = require('../utils/appError');

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi or Zod schema object with methods for different HTTP methods
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Determine which schema to use based on request method
      let schemaToUse;
      
      switch (req.method) {
        case 'POST':
          schemaToUse = schema.body || schema.create;
          break;
        case 'PUT':
        case 'PATCH':
          schemaToUse = schema.body || schema.update;
          break;
        case 'GET':
          schemaToUse = schema.query;
          break;
        case 'DELETE':
          schemaToUse = schema.params;
          break;
        default:
          schemaToUse = schema.body;
      }

      if (!schemaToUse) {
        return next();
      }

      // Validate using Joi schema
      const { error, value } = schemaToUse.validate(
        req.method === 'GET' ? req.query : req.body,
        { abortEarly: false, stripUnknown: true }
      );

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          code: 'VALIDATION_ERROR'
        }));

        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
      }

      // Replace req.body/query with validated data
      if (req.method === 'GET') {
        req.query = value;
      } else {
        req.body = value;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
