// This file contains all the routes for managing employees

// Imports
const express = require("express");
const manageEmployeeRouter = express.Router();
const { validationHandler } = require("../../middlewares/validationHandler");
const manageEmployeeController = require("../../controllers/admin/manageEmployeeController");

manageEmployeeRouter.post(
  "/",
  validationHandler({
    excludeFields: [""],
  }),
  manageEmployeeController.addEmployee
);

module.exports = { manageEmployeeRouter };
