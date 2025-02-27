// This middleware verifies user's role (Admin, Employee). Before calling this middleware JWT token must be verified

// Object to accumulate functions
const roleVerify = {};

roleVerify.isAdmin = (req, res, next) => {
  if (
    !req.user ||
    req.user.role !== "employee" ||
    !req.user.id ||
    !req.user.isAdmin
  ) {
    const err = new Error(
      "You do not have permissions to perform this action!"
    );
    err.status = 403;
    return next(err);
  }
  next();
};

roleVerify.isEmployee = (req, res, next) => {
  if (
    !req.user ||
    !req.user.id ||
    !req.user.id.startsWith("emp_") ||
    req.user.role !== "employee"
  ) {
    const err = new Error("You are not authorized to access this resource!");
    err.status = 403;
    return next(err);
  }
  next();
};

module.exports = roleVerify;
