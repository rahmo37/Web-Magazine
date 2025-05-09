// This file contains all the routes for managing employees

// Imports
const express = require("express");
const manageEmployeeRouter = express.Router();
const { validationHandler } = require("../../middlewares/validationHandler");
const manageEmployeeController = require("../../controllers/admin/manageEmployeeController");
const roleVerify = require("../../middlewares/roleVerification");
const verifyReqBody = require("../../middlewares/verifyReqBody");
const temporaryEndpointDisable = require("../../middlewares/temporaryEndpointDisable");

// Only Root Admins are allowed
manageEmployeeRouter.use(roleVerify.isRootAdmin);

// Request to '/' url
manageEmployeeRouter
  .route("/")
  // Get all employees
  .get(manageEmployeeController.getAllEmployees)
  // Create an employee
  .post(
    verifyReqBody,
    validationHandler(),
    manageEmployeeController.addEmployee
  );


// Request to "/:ID"
manageEmployeeRouter
  .route("/:ID(emp_[A-Za-z0-9]{6})")
  // Get an employee
  .get(manageEmployeeController.getAnEmployee)
  // Update an employee
  .patch(
    verifyReqBody,
    validationHandler(),
    manageEmployeeController.updateAnEmployee
  )
  // Delete an employee
  .delete(temporaryEndpointDisable, manageEmployeeController.deleteAnEmployee);

module.exports = { manageEmployeeRouter };
