const AppError = require('../utils/appError');

/**
 * Request Validation Middleware Factory
 * Creates validation middleware using provided schema validation function
 * 
 * Usage: validate(loginSchema.validateLogin)
 */
const validate = (validateFn) => {
  return async (req, res, next) => {
    try {
      const { error, value } = await validateFn(req.body);
      
      if (error) {
        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        err.details = error.details?.map(detail => ({
          message: detail.message,
          path: detail.path,
        }));
        throw err;
      }

      // Attach validated data to request
      req.validatedBody = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Query Parameter Validation Middleware
 * Validates and parses query parameters for pagination and filtering
 */
const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const { error, value } = await schema(req.query);
      
      if (error) {
        const err = new Error('Query validation failed');
        err.name = 'ValidationError';
        err.details = error.details?.map(detail => ({
          message: detail.message,
          path: detail.path,
        }));
        throw err;
      }

      req.validatedQuery = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
module.exports.validateQuery = validateQuery;
