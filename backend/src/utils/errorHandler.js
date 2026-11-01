function createHttpError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
function notFound(req, res) {
  return res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode <= 599 ? err.statusCode : 500;
  if (status >= 500) console.error("API error:", err);
  return res.status(status).json({ success: false, message: status === 500 ? "Internal server error" : err.message });
}
module.exports = { createHttpError, notFound, errorHandler };
