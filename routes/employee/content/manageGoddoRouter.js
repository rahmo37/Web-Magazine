// This file contains all the routes for managing Goddo

// Imports
const express = require("express");
const manageGoddoRouter = express.Router();
const manageGoddoController = require("../../../controllers/employee/content/manageGoddoController");
const authenticateToken = require("../../../middlewares/jwtTokenVerify");
const roleVerify = require("../../../middlewares/roleVerification");
const { accessVerify } = require("../../../middlewares/verifyEmployeeAccess");
const verifyReqBody = require("../../../middlewares/verifyReqBody");

// Request must have JWT token, must come from an employee
manageGoddoRouter.use(
  authenticateToken,
  roleVerify.isEmployee,
  accessVerify("goddo")
);

manageGoddoRouter
  .route("/")
  // Get all godoo
  .get(manageGoddoController.getAllGoddo)
  // Post a goddo
  .post(verifyReqBody, manageGoddoController.postAGoddo);

// Gat a goddo
manageGoddoRouter.get(
  "/:ID(god_[A-Za-z0-9]{12})",
  manageGoddoController.getAGoddo
);

// Export the router
module.exports = { manageGoddoRouter };
