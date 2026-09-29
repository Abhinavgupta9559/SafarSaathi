/* eslint-disable no-unused-vars */

/** 404 handler - must be registered after all routes. */
function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

/** Central error handler - never leaks stack traces in production. */
function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong on the server.",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
