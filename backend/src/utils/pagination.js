/**
 * Pagination Utility
 * Standardises pagination parameters from query strings
 */

/**
 * Parse and validate pagination parameters
 * @param {Object} query - Express query object
 * @param {number} defaultLimit - Default limit value
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {Object} - Parsed pagination parameters
 */
const parsePagination = (query, defaultLimit = 20, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

/**
 * Build pagination response metadata
 * @param {number} total - Total number of records
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Build paginated response
 * @param {Array} data - Array of items
 * @param {number} total - Total number of records
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Paginated response object
 */
const paginate = (data, total, page, limit) => {
  return {
    items: data,
    ...buildPaginationMeta(total, page, limit),
  };
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
  paginate,
};
