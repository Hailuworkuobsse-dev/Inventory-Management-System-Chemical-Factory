/**
 * Standardized Response Handler
 * Provides consistent JSON response formatting across all endpoints
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data payload
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, message = 'Operation completed successfully', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    errors: null,
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string|Array} errors - Error details or array of errors
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const errorResponse = (res, message = 'An error occurred', errors = null, code = 'ERROR', statusCode = 500) => {
  const errorPayload = Array.isArray(errors) ? errors : [{ code, description: errors }];
  
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errors: errorPayload,
  });
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items
 * @param {number} total - Total count of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 */
const paginatedResponse = (res, items, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
    message,
    errors: null,
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
