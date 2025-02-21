// This module has all the controller logics for managing employees

// Importing necessary modules
const { validator } = require("../../helpers/validator");
const Employee = require("../../models/Employee");
const flattenObject = require("../../helpers/flattenObject");
const structureChecker = require("../../helpers/structureChecker");
const { getErrorObj } = require("../../helpers/getErrorObj");

// Module scaffolding
const manageEmployee = {};

// Add an employee
manageEmployee.addEmployee = (req, res, next) => {
  try {
    const employeeKeys = Employee.getKeys();
    const providedKeys = Object.keys(flattenObject(req.body));
    if (!structureChecker(employeeKeys, providedKeys)) {
      return next(
        getErrorObj(
          `One or more invalid keys provided for new employee. Please check the request carefully and try again needed keys are: ${employeeKeys.join(
            ", "
          )}`,400
        )
      );
    }
    res.send("Constructing...");
  } catch (error) {
    next(error);
  }
};

module.exports = manageEmployee;
