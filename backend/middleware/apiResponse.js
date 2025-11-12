// REMOVED: API response middleware
module.exports = {
  apiResponseMiddleware: (req, res, next) => next(),
  errorHandler: (err, req, res, next) => res.status(500).json({ error: 'Backend removed' }),
  asyncHandler: fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next),
  requestLogger: (req, res, next) => next()
};
