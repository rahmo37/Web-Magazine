// Error Handler for errors

module.exports = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message:
        err.message ||
        "Internal server error! Please contact you administrator.",
    },
  });
};
