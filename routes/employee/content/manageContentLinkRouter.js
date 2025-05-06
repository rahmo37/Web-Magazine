// This file contains all the routes for managing a link

// Imports
const express = require("express");
const manageContentLinkRouter = express.Router();
const manageContentLinkController = require("../../../controllers/employee/content/manageContentLinkController");
const {
  routeAccessVerify,
} = require("../../../middlewares/verifyEmployeeAccessOnDepartments");
const validateDepartmentParam = require("../../../middlewares/validateDepartmentParam");
const verifyReqBody = require("../../../middlewares/verifyReqBody");
const { validationHandler } = require("../../../middlewares/validationHandler");

// Update a content link
manageContentLinkRouter.patch(
  "/:department/:contentID",
  // Validate department param
  validateDepartmentParam,
  // Only root admin and department admin can access
  routeAccessVerify(null, true),
  // Verify the body
  verifyReqBody,
  // Validate the IDs
  validationHandler(),
  // Now we update the content link
  manageContentLinkController.updateContentLink
);

// Export the module
module.exports = { manageContentLinkRouter };
