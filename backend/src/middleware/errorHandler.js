const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';
  let errors = null;

  // Prisma error handling
  if (err.code === 'P2002') {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'A record with this unique constraint already exists';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Record not found';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    code = 'FOREIGN_KEY_ERROR';
    message = 'Foreign key constraint failed';
  }

  // Joi validation error
  if (err.isJoi) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    errors = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }

  // Log error in production
  if (process.env.NODE_ENV !== 'development') {
    console.error(`[${new Date().toISOString()}] ${code}: ${message}`);
  } else {
    console.error(err);
  }

  // Send response
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errors: errors || [{ code, description: message }]
  });
};

module.exports = errorHandler;
