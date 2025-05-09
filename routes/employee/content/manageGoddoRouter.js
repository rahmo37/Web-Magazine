// This file contains all the routes for managing Goddo

// Imports
const express = require("express");
const manageGoddoRouter = express.Router();
const manageGoddoController = require("../../../controllers/employee/content/manageGoddoController");
const {
  routeAccessVerify,
  modificationAccessVerify,
  explicitDenyVerify,
} = require("../../../middlewares/verifyEmployeeAccessOnDepartments");
const verifyReqBody = require("../../../middlewares/verifyReqBody");
const { validationHandler } = require("../../../middlewares/validationHandler");
const getRegexForID = require("../../../helpers/getRegexForID");

// Necessary variables
const department = "goddo";

// Only Root Admins and the employees in goddo departments are allowed
manageGoddoRouter.use(routeAccessVerify(department));

// manageGoddoRouter.use((req, res, next) => {
//   console.log("Hi");
// });

manageGoddoRouter
  .route("/")
  // Get all godoo
  .get(manageGoddoController.getAllGoddo)
  // Post a goddo
  .post(
    // See if the employee is explicitly denied to post any content
    // explicitDenyVerify(department),
    // Verify the request body
    verifyReqBody,
    // Validate the posted fields
    validationHandler(),
    // Post goddo controller
    manageGoddoController.postAGoddo
  );

manageGoddoRouter
  .route(
    `/:subID(${getRegexForID("god_sub_", 12)})/:godID(${getRegexForID(
      "god_",
      12
    )})(/:secID${getRegexForID("sec_", 12)})?`
  )
  // Update a goddo section, metadata or article
  .patch(
    // Check if the logged in user has modification permission
    modificationAccessVerify("godID", department), //! Please recheck this middleware may have bugs
    // Verify if the body is invalid
    verifyReqBody,
    // Validate the request body fields
    validationHandler(),
    // Update a goddo section inside the main content
    manageGoddoController.updateAGoddoSection,
    // Update metadata of a goddo
    manageGoddoController.updateAGoddoMetadata,
    // Update article data of a goddo
    manageGoddoController.updateAGoddoArticledata
  )
  .delete(
    // Check if the logged in user has modification permission
    modificationAccessVerify("godID", department),
    // Delete a goddo section
    manageGoddoController.deleteAGoddoSection,
    // Delete an entire goddo
    manageGoddoController.deleteAGoddo
  );

// Gat a goddo
manageGoddoRouter.get(
  `/:ID${getRegexForID("god_", 12)}`,
  manageGoddoController.getAGoddo
);

// Export the router
module.exports = { manageGoddoRouter };
