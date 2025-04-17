// This module verifies if an employee has the permission to perform operation on contents
const Employee = require("../models/Employee");
const { getErrorObj } = require("../helpers/getErrorObj");
const getRegexForID = require("../helpers/getRegexForID");
const Link = require("../models/Link");

// This function verifies access to the content
function routeAccessVerify(content) {
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

    // If the user is not a root admin but the content does not exist in their department list (either regular employee or department admin)
    if (!employee.department.includes(content)) {
      return next(
        getErrorObj(
          "You do not have permission to perform any action in this department!",
          401
        )
      );
    }

    // If content exists in the employee department list, call next
    next();
  };
}

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
    // Check for link as an extra step
    const link = await Link.getByContentID(contentID);
    if (!link) {
      return next(getErrorObj("No Link found for the contentID provided", 401));
    }

    // !delete console.log(loggedEmployee);
    // If employee is a root admin or the employee is a department admin and has * or goddo as the department
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

// Export the module
module.exports = { routeAccessVerify, modificationAccessVerify };
