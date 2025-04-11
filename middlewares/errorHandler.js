// Error Handler for errors

module.exports = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message:
        err.message ||
        "Internal server error! Please contact your administrator.",
      // Include error stack only in development mode:
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};
