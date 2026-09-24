/**
 * Standardise pagination parameters from query strings
 * @param {Object} query - Express request query object
 * @param {number} defaultLimit - Default limit if not provided
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {Object} Pagination object with page, limit, skip, and take
 */
const getPagination = (query, defaultLimit = 20, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit
  };
};

/**
 * Format paginated response
 * @param {Array} items - Array of items
 * @param {number} total - Total count of items
 * @param {Object} pagination - Pagination object
 * @returns {Object} Formatted response with items and meta
 */
const formatPaginatedResponse = (items, total, pagination) => {
  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
    hasMore: pagination.page * pagination.limit < total
  };
};

module.exports = {
  getPagination,
  formatPaginatedResponse
};
