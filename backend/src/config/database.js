/**
 * Database Configuration
 * Connection pool settings and Prisma client setup
 */

const pool = {
  // Maximum number of connections in the pool
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  
  // Minimum number of connections in the pool
  min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
  
  // How long to wait before timing out when acquiring a connection
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 30000,
  
  // How long to keep idle connections in the pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 600000,
  
  // How frequently to check for idle connections to close
  reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL, 10) || 60000,
  
  // Number of times to retry acquiring a connection
  maxRetries: parseInt(process.env.DB_MAX_RETRIES, 10) || 3,
  
  // Retry delay in milliseconds
  retryDelay: parseInt(process.env.DB_RETRY_DELAY, 10) || 1000
};

// Query logging
const logQueries = process.env.LOG_QUERIES === 'true';

// SSL configuration for production
const ssl = process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false
} : false;

module.exports = {
  pool,
  logQueries,
  ssl,
  
  // Helper to get connection string with pool params
  getConnectionString() {
    const url = new URL(process.env.DATABASE_URL);
    
    // Add pool parameters to connection string if using PostgreSQL
    if (url.protocol === 'postgresql:' || url.protocol === 'postgres:') {
      url.searchParams.set('pool_max', pool.max);
      url.searchParams.set('pool_min', pool.min);
      url.searchParams.set('connect_timeout', pool.acquireTimeoutMillis / 1000);
      url.searchParams.set('idle_in_transaction_session_timeout', pool.idleTimeoutMillis / 1000);
    }
    
    return url.toString();
  },
  
  // Validate database configuration
  validate() {
    const errors = [];
    
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL environment variable is required');
    }
    
    if (pool.max < pool.min) {
      errors.push('DB_POOL_MAX must be greater than or equal to DB_POOL_MIN');
    }
    
    if (pool.acquireTimeoutMillis <= 0) {
      errors.push('DB_ACQUIRE_TIMEOUT must be positive');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};
