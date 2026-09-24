// Database configuration options
// These settings can be used to configure Prisma connection pool or other DB-specific settings

module.exports = {
  // Connection pool settings (for production environments)
  POOL_MIN: parseInt(process.env.DB_POOL_MIN) || 2,
  POOL_MAX: parseInt(process.env.DB_POOL_MAX) || 10,
  
  // Connection timeout in milliseconds
  CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
  
  // Query logging (enable in development)
  LOG_QUERIES: process.env.NODE_ENV !== 'production',
  
  // Retry settings
  MAX_RETRIES: parseInt(process.env.DB_MAX_RETRIES) || 3,
  RETRY_DELAY: parseInt(process.env.DB_RETRY_DELAY) || 1000,
  
  // MySQL specific settings (if using MySQL)
  MYSQL_CHARSET: process.env.MYSQL_CHARSET || 'utf8mb4',
  MYSQL_TIMEZONE: process.env.MYSQL_TIMEZONE || '+00:00'
};
