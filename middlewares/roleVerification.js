// This middleware verifies user's role (Admin, Employee). Before calling this middleware JWT token must be verified

// Object to accumulate functions

const roleVerify = {};
const { getErrorObj } = require("../helpers/getErrorObj");

roleVerify.isRootAdmin = (req, res, next) => {
  if (!req.user) {
    console.error(
      "You must verify Json Web Token before calling 'isRootAdmin' middleware"
    );
    return next(getErrorObj());
  }
  if (
    req.user.role !== "employee" ||
    !req.user.ID ||
    req.user.employeeType.toLowerCase() !== "ra"
  ) {
    const err = new Error(
      "You do not have permissions to perform this action!"
    );
    err.status = 403;
    return next(err);
  }
  return next();
};

roleVerify.isEmployee = (req, res, next) => {
  if (!req.user) {
    console.error(
      "You must verify Json Web Token before calling 'isEmployee' middleware"
    );
    return next(getErrorObj());
  }
  if (
    !req.user.ID ||
    !req.user.ID.startsWith("emp_") ||
    req.user.role !== "employee"
  ) {
    const err = new Error("You are not authorized to access this resource!");
    err.status = 403;
    return next(err);
  }
  return next();
};

module.exports = roleVerify;
