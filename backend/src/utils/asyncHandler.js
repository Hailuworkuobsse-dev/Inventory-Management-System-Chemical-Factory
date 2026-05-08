/**
 * Async Handler Utility
 * Wraps async Express route handlers to catch errors and pass them to next()
 * 
 * Express doesn't automatically catch async errors, so we need this wrapper.
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
