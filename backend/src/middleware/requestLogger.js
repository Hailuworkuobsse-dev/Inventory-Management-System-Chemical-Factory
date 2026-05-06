const morgan = require('morgan');

// Custom token for request ID (could be extended with uuid)
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms');

module.exports = requestLogger;
