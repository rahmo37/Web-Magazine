// This module verifies if an employee has the permission to perform operation on various departments
const Employee = require("../models/Employee");
const { getErrorObj } = require("../helpers/getErrorObj");
const getRegexForID = require("../helpers/getRegexForID");
const Link = require("../models/Link");

// This function checks access permissions for the entire department route.
function routeAccessVerify(department) {
  return async function (req, res, next) {
    // Valid Departments
    const validDepartments = process.env.DEPARTMENTS.split(",");

    // See if the department passed is in the valid departments list
    if (!department || !validDepartments.includes(department)) {
      console.error(
        "You must provide a valid department type in order to verify access"
      );
      return next(getErrorObj());
    }

    // See if the Json Web Token is verified
    if (!req.user) {
      console.error(
        "You must verify Json Web Token before calling 'routeAccessVerify' middleware"
      );
      return next(getErrorObj());
    }

    // Retrieve the employee
    const ID = req.user.ID;
    const employee = await Employee.getEmployeeByID(ID);
    if (!employee) {
      return next(
        getErrorObj("You do not have permission to access this portal!", 401)
      );
    }

    // If user is a root admin or a department admin
    if (
      req.user.employeeType === "ra" ||
      (req.user.employeeType === "da" && employee.department.includes("*"))
    ) {
      return next();
    }

    // If the user is not a root admin but the department does not exist in their allowed department list (either regular employee or department admin)
    if (!employee.department.includes(department)) {
      return next(
        getErrorObj(
          "You do not have permission to perform any action in this department!",
          401
        )
      );
    }

    // If department exists in the employee department list, call next
    next();
  };
}

// This function checks whether the department an employee is trying to modify actually belongs to them.
function modificationAccessVerify(key, prefix) {
  return async function (req, res, next) {
    // Retrieve the employee
    const loggedEmployee = await Employee.getEmployeeByID(req.user.ID);

    //If no employee found
    if (!loggedEmployee) {
      return next(
        getErrorObj("You do not have permission to access this portal!", 401)
      );
    }

    // Get the contentID
    const contentID = req.params[key];

    // Check if this content has a Link as an Extra step
    const link = await Link.getByContentID(contentID);
    if (!link) {
      return next(getErrorObj("No Link found for the contentID provided", 401));
    }

    // !delete console.log(loggedEmployee);
    // If employee is a root admin or the employee is a department admin and has * or goddo as the department we call next
    if (
      loggedEmployee.employeeType === "ra" ||
      (loggedEmployee.employeeType === "da" &&
        loggedEmployee.department.some((dep) => /^(goddo|\*)$/i.test(dep)))
    ) {
      return next();
    }

    // And the employeeID
    const employeeID = loggedEmployee.employeeID;

    // Get the content with the contentID and the employeeID
    const content = await Link.getByContentIDAndEmpID(contentID, employeeID);
    if (!content) {
      return next(
        getErrorObj(
          "You do not have permission to perform any modification in this content",
          401
        )
      );
    }
    return next();
  };
}

function explicitDenyVerify(department) {
  return async function (req, res, next) {
    // Valid Departments
    const validDepartments = process.env.DEPARTMENTS.split(",");

    // See if the department passed is in the valid departments list
    if (!department || !validDepartments.includes(department)) {
      console.error(
        "You must provide a valid department type in order to verify access"
      );
      return next(getErrorObj());
    }

    // See if the Json Web Token is verified
    if (!req.user) {
      console.error(
        "You must verify Json Web Token before calling 'explicitDenyVerify' middleware"
      );
      return next(getErrorObj());
    }

    // Retrieve the logged-in employee
    const ID = req.user.ID;
    const employee = await Employee.getEmployeeByID(ID);
    if (!employee) {
      return next(
        getErrorObj("You do not have permission to access this portal!", 401)
      );
    }

    // If root admin call next middleware
    if (employee.employeeType === "ra") {
      return next();
    }

    // If explicit deny department exists
    if (employee.deniedDepartment.includes(department)) {
      return next(
        getErrorObj(
          "You cannot perform this action at this time. Please contact your administrator!",
          401
        )
      );
    }
    next();
  };
}

// Export the module
module.exports = {
  routeAccessVerify,
  modificationAccessVerify,
  explicitDenyVerify,
};
