// This file contains all the routes for managing employees

// Imports
const express = require("express");
const manageEmployeeRouter = express.Router();
const { validationHandler } = require("../../middlewares/validationHandler");
const manageEmployeeController = require("../../controllers/admin/manageEmployeeController");
const authenticateToken = require("../../middlewares/jwtTokenVerify");
const roleVerify = require("../../middlewares/roleVerification");

// Request must have JWT token, must come from an employee with admin privilege
manageEmployeeRouter.use(
  authenticateToken,
  roleVerify.isEmployee,
  roleVerify.isRootAdmin
);

// Request to '/' url
manageEmployeeRouter
  .route("/")
  // Get all employees
  .get(manageEmployeeController.getAllEmployees)
  // Create an employee
  .post(validationHandler(), manageEmployeeController.addEmployee);

manageEmployeeRouter
  .route("/:ID(emp_[A-Za-z0-9]{6})")
  // Get an employee
  .get(manageEmployeeController.getAnEmployee)
  // Update an employee
  .patch(validationHandler(), manageEmployeeController.updateAnEmployee)
  // Delete an employee
  .delete(manageEmployeeController.deleteAnEmployee);

module.exports = { manageEmployeeRouter };
