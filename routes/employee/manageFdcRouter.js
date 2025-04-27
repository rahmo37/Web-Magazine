// This file contains all the routes for managing Fdcs

// Imports
const express = require("express");
const manageFdcRouter = express.Router();
const manageFdcController = require("../../controllers/employee/manageFdcController");
const verifyReqBody = require("../../middlewares/verifyReqBody");
const { validationHandler } = require("../../middlewares/validationHandler");
const getRegexForID = require("../../helpers/getRegexForID");

// Get all FDCs
manageFdcRouter.get("/", manageFdcController.getAllFdc);

// Get an FDC with fdcID
manageFdcRouter.get(`/:fdcID${getRegexForID("fdc_", 12)}`, manageFdcController.getAnFdc);

// Export the router
module.exports = { manageFdcRouter };
