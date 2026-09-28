/**
 * Wraps async route handlers to catch errors and pass them to the Express next() function.
 * This avoids the need for try/catch blocks in every controller.
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
