// This file routes the employee login requests to the corresponding controller function

// Imports
const express = require("express");
const employeeLoginRouter = express.Router();
const employeeLoginController = require("../../controllers/login/employeeLoginController");
const verifyReqBody = require("../../middlewares/verifyReqBody");

employeeLoginRouter.post("/", verifyReqBody, employeeLoginController.login);

module.exports = { employeeLoginRouter };
