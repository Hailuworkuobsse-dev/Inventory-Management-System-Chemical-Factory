/**
 * Custom Application Error Class
 * Extends the native Error class with additional properties for consistent error handling
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'APPLICATION_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }

  // Common error factories
  static badRequest(message, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  static unauthorized(message, code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  static forbidden(message, code = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  static notFound(message, code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  static tooManyRequests(message, code = 'TOO_MANY_REQUESTS') {
    return new AppError(message, 429, code);
  }

  static internal(message, code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code, false);
  }
}

module.exports = AppError;
