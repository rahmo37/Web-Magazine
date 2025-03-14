// This module verifies if an employee has the permission to perform operation on contents
const Employee = require("../models/Employee");
const { getErrorObj } = require("../helpers/getErrorObj");

// This function verifies access to the content
function accessVerify(content) {
  return async function (req, res, next) {
    // Valid Departments
    const validDepartments = process.env.DEPARTMENTS.split(",");

    // See if the content passed is in the valid departments list
    if (!content || !validDepartments.includes(content)) {
      console.error(
        "You must provide a valid content type in order to verify access"
      );
      return next(getErrorObj());
    }

    // See if the Json Web Token is verified
    if (!req.user) {
      console.error(
        "You must verify Json Web Token before calling 'accessVerify' middleware"
      );
      return next(getErrorObj());
    }

    // Retrieve the employee
    const ID = req.user.id;
    const employee = await Employee.getEmployeeByID(ID);
    if (!employee) {
      return next(
        getErrorObj("You do not have permission to access this portal!", 401)
      );
    }

    // If user is a root admin
    if (
      req.user.employeeType === "ra" ||
      (req.user.employeeType === "da" && employee.department.includes("*"))
    ) {
      return next();
    }

    // If the user is not an admin or a department admin, but the content does not exist in their department list
    if (!employee.department.includes(content)) {
      return next(
        getErrorObj("You do not have permission to perform this action!", 401)
      );
    }

    // If content exists in the employee department list, call next
    next();
  };
}

// Export the module
module.exports = { accessVerify };
