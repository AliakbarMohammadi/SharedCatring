/**
 * Pagination helper utilities
 */

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Request query object
 * @param {Object} defaults - Default values
 * @returns {Object} Parsed pagination parameters
 */
const parsePagination = (query, defaults = {}) => {
  const {
    page = defaults.page || 1,
    limit = defaults.limit || 10,
    sortBy = defaults.sortBy || 'createdAt',
    sortOrder = defaults.sortOrder || 'desc'
  } = query;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
    sortBy,
    sortOrder: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc'
  };
};

/**
 * Build pagination metadata for response
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Build Sequelize pagination options
 * @param {Object} pagination - Parsed pagination parameters
 * @returns {Object} Sequelize options
 */
const buildSequelizeOptions = (pagination) => {
  return {
    limit: pagination.limit,
    offset: pagination.offset,
    order: [[pagination.sortBy, pagination.sortOrder.toUpperCase()]]
  };
};

/**
 * Build MongoDB pagination options
 * @param {Object} pagination - Parsed pagination parameters
 * @returns {Object} MongoDB options
 */
const buildMongoOptions = (pagination) => {
  const sortDirection = pagination.sortOrder === 'asc' ? 1 : -1;
  
  return {
    skip: pagination.offset,
    limit: pagination.limit,
    sort: { [pagination.sortBy]: sortDirection }
  };
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
  buildSequelizeOptions,
  buildMongoOptions
};
