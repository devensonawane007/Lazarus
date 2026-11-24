/**
 * Centralized Express Error Handler
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" && statusCode === 500
      ? "An unexpected error occurred"
      : message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
};

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
