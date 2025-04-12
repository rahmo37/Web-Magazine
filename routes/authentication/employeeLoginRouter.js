// This file routes the employee login requests to the corresponding controller function

// Imports
const express = require("express");
const employeeLoginRouter = express.Router();
const employeeLoginController = require("../../controllers/login/employeeLoginController");

employeeLoginRouter.post("/", employeeLoginController.login);
 
module.exports = { employeeLoginRouter };
