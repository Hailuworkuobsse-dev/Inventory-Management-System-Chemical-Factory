const morgan = require('morgan');

/**
 * Request Logger Middleware
 * Logs every request with method, URL, response time, and status code
 */
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms');

module.exports = requestLogger;
