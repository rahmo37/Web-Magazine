// This module has all the controller logics for managing employees

// Importing necessary modules
const Employee = require("../../models/Employee");
const flattenObject = require("../../helpers/flattenObject");
const structureChecker = require("../../helpers/structureChecker");
const { getErrorObj } = require("../../helpers/getErrorObj");
const { sendRequest } = require("../../helpers/sendRequest");
const { dateAndTime } = require("../../helpers/dateAndTime");
const { generateID } = require("../../helpers/generateID");

// Module scaffolding
const manageEmployee = {};

// Add an employee
manageEmployee.addEmployee = async (req, res, next) => {
  try {
    const passedInEmployeeInfo = flattenObject(req.body);
    const employeeKeys = Employee.getKeys();
    const providedKeys = Object.keys(passedInEmployeeInfo);
    if (!structureChecker(employeeKeys, providedKeys)) {
      return next(
        getErrorObj(
          `Employee information is either missing or contains invalid keys. Please review your submission and try again. The required keys are: ${employeeKeys.join(
            ", "
          )}`,
          400
        )
      );
    }

    // Destructuring values
    const {
      email,
      phone,
      password,
      dateJoined,
      isAdmin,
      department,
      firstName,
      lastName,
      gender,
      dateOfBirth,
    } = passedInEmployeeInfo;

    // Creating new employee with values
    const newEmployeeObject = {
      email,
      phone,
      password,
      dateJoined,
      isAdmin,
      department,
      employeeBio: { firstName, lastName, gender, dateOfBirth },
    };

    // Gathering other necessary information
    newEmployeeObject.lastLogin = null;
    newEmployeeObject.isAdmin = false;
    newEmployeeObject.isActiveAccount = true;
    newEmployeeObject.accountCreated = dateAndTime.getUtcRaw();
    newEmployeeObject.employeeID = generateID("emp_", 3);

    // Now we create a employee
    const newEmployee = await Employee.createEmployee(newEmployeeObject);

    // If the unable to create employee
    if (!newEmployee) {
      return next(
        getErrorObj(
          "Employee creation failed! Please contact technical support for assistance",
          500
        )
      );
    }

    // Now sending the response with the new employee data
    sendRequest({
      res,
      statusCode: 200,
      message: "New employee created",
      data: newEmployeeObject,
    });
  } catch (error) {
    // Log the message
    console.error(error.message);

    // Send a generic error to the client
    next(getErrorObj());
  }
};

module.exports = manageEmployee;
