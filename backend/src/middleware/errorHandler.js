const AppError = require('../utils/appError');

/**
 * Global Error Handler Middleware
 * Handles all errors consistently and formats them according to API contract
 */
const errorHandler = (err, req, res, next) => {
  // Set default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';
  let errors = err.errors || null;

  // Log error for debugging (in production, use a proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
  } else {
    console.error(`[${new Date().toISOString()}] ${err.code}: ${err.message}`);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    
    // Unique constraint violation
    if (err.code === 'P2002') {
      message = 'A record with this value already exists';
      errors = [{ code: 'UNIQUE_CONSTRAINT', description: message }];
    }
    // Record not found
    else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
      code = 'NOT_FOUND';
    }
    // Foreign key constraint
    else if (err.code === 'P2003') {
      message = 'Related record not found';
      errors = [{ code: 'FOREIGN_KEY_CONSTRAINT', description: message }];
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Handle validation errors (Joi/Zod would set name to 'ValidationError')
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    errors = err.details?.map(detail => ({
      code: 'INVALID_FIELD',
      description: detail.message,
      field: detail.path?.join('.'),
    })) || [{ code: 'VALIDATION_ERROR', description: message }];
  }

  // Handle multer (file upload) errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    code = 'UPLOAD_ERROR';
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the maximum allowed limit';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
  }

  // Send error response using API contract format
  const errorPayload = Array.isArray(errors) ? errors : [{ code, description: message }];

  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errors: errorPayload,
  });
};

module.exports = errorHandler;
