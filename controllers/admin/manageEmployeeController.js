// This module has all the controller logics for managing employees

// Importing necessary modules
const Employee = require("../../models/Employee");
const flattenObject = require("../../helpers/flattenObject");
const structureChecker = require("../../helpers/structureChecker");
const { getErrorObj } = require("../../helpers/getErrorObj");
const { sendRequest } = require("../../helpers/sendRequest");
const { dateAndTime } = require("../../helpers/dateAndTime");
const { generateID } = require("../../helpers/generateID");
const { getHashedPassword } = require("../../helpers/hashPassword");

// Module scaffolding
const manageEmployee = {};

// Get all employee
manageEmployee.getAllEmployees = async (req, res, next) => {
  try {
    // Retrieving all the employees
    const allEmployees = await Employee.getAllEmployees();

    if (!allEmployees || allEmployees.length === 0) {
      return next(
        getErrorObj(`Unable to retrieve employees, or no employees exist`, 404)
      );
    }

    // Send the employee data
    sendRequest({
      res,
      statusCode: 200,
      message: "All employee information attached",
      data: allEmployees,
    });
  } catch (error) {
    next(error);
  }
};

// Get an employee
manageEmployee.getAnEmployee = async (req, res, next) => {
  try {
    // Retrieve the ID
    const { ID } = req.params;

    // If the ID does not start with emp_
    if (!ID.startsWith("emp_")) {
      return next(
        getErrorObj(`ID provided with the request is not valid`, 404)
      );
    }

    // Retrieve the employee
    const employee = await Employee.getEmployeeByID(ID);

    if (!employee) {
      return next(getErrorObj(`No employee found with the provided ID`, 404));
    }

    // Now sending the employee info
    sendRequest({
      res,
      statusCode: 200,
      message: "Employee info attached",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

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
    let {
      email,
      phone,
      password,
      dateJoined,
      employeeType,
      department,
      firstName,
      lastName,
      gender,
      dateOfBirth,
    } = passedInEmployeeInfo;

    // Check if the employee already exists with the email address provided
    const doesExistsWithEmail = await Employee.getEmployeeByEmail(email);

    // If employee exists
    if (doesExistsWithEmail) {
      return next(
        getErrorObj(
          `An employee already exists with the email address provided!`,
          409
        )
      );
    }

    // Check if the employee already exists with the phone number provided
    const doesExistsWithPhone = await Employee.getEmployeeByPhone(phone);

    // If employee exists
    if (doesExistsWithPhone) {
      return next(
        getErrorObj(
          `An employee already exists with the phone number provided!`,
          409
        )
      );
    }

    // If root admin provide full content access
    if (employeeType === "ra") {
      department = ["*"];
    }

    // Make each dept name lowercase
    department = department.map((dept) => dept.toLowerCase());

    // Creating new employee with values
    const newEmployeeObject = {
      email: email.toLowerCase(),
      phone,
      password: await getHashedPassword(password),
      dateJoined,
      employeeType,
      department,
      employeeBio: { firstName, lastName, gender, dateOfBirth },
    };

    // Gathering other necessary information
    newEmployeeObject.lastLogin = null;
    newEmployeeObject.isActiveAccount = true;
    newEmployeeObject.accountCreated = dateAndTime.getUtcRaw();
    newEmployeeObject.employeeID = generateID("emp_", 3);

    // Now create an employee
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
      statusCode: 201,
      message: "New employee created",
      data: newEmployee,
    });
  } catch (error) {
    // Log the message
    console.error(error.message);

    // Send a generic error to the client
    next(getErrorObj());
  }
};

// Update an employee info
manageEmployee.updateAnEmployee = async (req, res, next) => {
  try {
    // Retrieve the ID
    const { ID } = req.params;

    // If the ID does not start with emp_
    if (!ID.startsWith("emp_")) {
      return next(
        getErrorObj(`ID provided with the request is not valid`, 404)
      );
    }

    // Retrieve the employee
    const employee = await Employee.getEmployeeByID(ID);

    // If no employee found with the provided ID
    if (!employee) {
      return next(getErrorObj(`No employee found with the provided ID`, 404));
    }

    // Now retrieve the update information
    const updateInfo = req.body;

    // Flatten the updated info if provided in a nested structure
    const flattenedUpdateInfo = flattenObject(updateInfo);

    // Convert employee keys to a Set for faster lookup
    const employeeKeysSet = new Set(Employee.getKeys());

    // Add the isActiveAccount field manually since the getKeys() does not return isActiveAccount key
    if (ID !== req.user.ID) {
      employeeKeysSet.add("isActiveAccount");
    }

    // Find invalid keys
    const invalidKeys = Object.keys(flattenedUpdateInfo).filter(
      (key) => !employeeKeysSet.has(key)
    );

    // If there are invalid keys, return an error
    if (invalidKeys.length > 0) {
      return next(
        getErrorObj(`Invalid keys found: ${invalidKeys.join(", ")}`, 400)
      );
    }

    // If the employee is an admin
    if (ID !== req.user.ID && employee.employeeType === "ra") {
      return next(
        getErrorObj(`You cannot update another root admin's information`, 400)
      );
    }

    // Hash the password if exists
    if (flattenedUpdateInfo.password) {
      flattenedUpdateInfo.password = await getHashedPassword(
        flattenedUpdateInfo.password
      );
    }

    // If the employee is promoted to root admin, then change the department to *
    if (
      flattenedUpdateInfo.employeeType &&
      flattenedUpdateInfo.employeeType === "ra"
    ) {
      flattenedUpdateInfo.department = ["*"];
    }

    // if department is being updated ensure all the names are in lowercase
    if (flattenedUpdateInfo.department) {
      flattenedUpdateInfo.department = flattenedUpdateInfo.department.map(
        (dept) => dept.toLowerCase()
      );
    }

    // Update the employee
    const updatedEmployee = await employee.updateAnEmployee(
      flattenedUpdateInfo
    );

    // Convert Mongoose document to a plain object
    const updatedEmployeeObj = updatedEmployee.toObject();

    // Delete the password before sending
    delete updatedEmployeeObj.password;

    // Now sending the response with the new employee data
    sendRequest({
      res,
      statusCode: 200,
      message: "Employee updated",
      data: updatedEmployeeObj,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an employee
manageEmployee.deleteAnEmployee = async (req, res, next) => {
  try {
    // Retrieve the id
    const { ID } = req.params;

    // If the id does not start with emp_
    if (!ID.startsWith("emp_")) {
      return next(
        getErrorObj(`ID provided with the request is not valid`, 404)
      );
    }

    // If the id provide is the same as logged in admin
    if (ID === req.user.ID) {
      return next(
        getErrorObj(
          `You cannot delete your own account through this portal. Please contact your administrator`,
          403
        )
      );
    }

    // Retrieve the employee
    const employee = await Employee.getEmployeeByID(ID);

    // If no employee found with the provided ID
    if (!employee) {
      return next(getErrorObj(`No employee found with the provided ID`, 404));
    }

    // If the ID provided is another admin's
    if (ID !== req.user.ID && employee.employeeType === "ra") {
      return next(
        getErrorObj(`You cannot delete another admin's account`, 403)
      );
    }

    // Now delete the employee
    const result = await Employee.deleteEmployeeByID(ID);

    // If deletion was not completed
    if (result.deletedCount !== 1) {
      return next(getErrorObj());
    }

    // Now send the confirmation
    sendRequest({
      res,
      statusCode: 200,
      message: "Employee deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Export the manageEmployee object
module.exports = manageEmployee;
