// This file manages all the FDC operations
// Imports
const FirstDegreeCreator = require("../../models/FirstDegreeCreator");
const { sendRequest } = require("../../helpers/sendRequest");
const { getErrorObj } = require("../../helpers/getErrorObj");

// Module Scaffolding
const manageFdc = {};

// This function return all the fdcs
manageFdc.getAllFdc = async function (req, res, next) {
  try {
    // Make a request to get all the current FDCs
    const allFdcs = await FirstDegreeCreator.getAllFDCs();

    // If no FDCs found
    if (!allFdcs) {
      return next(getErrorObj("No FDCs found in the repository!"));
    }

    // Send the request and attach all FDCs
    sendRequest({
      res,
      statusCode: 200,
      length: allFdcs.length,
      message: "All FDC information attached",
      data: allFdcs,
    });
  } catch (error) {
    return next(error);
  }
};

// This function will one FDC with an ID
manageFdc.getAnFdc = async function (req, res, next) {
  try {
    // Retrieve the fdcID
    const { fdcID } = req.params;

    // Retrieve the FDC
    const retrievedFdc = await FirstDegreeCreator.getFdcByID(fdcID);

    // If FDC not found
    if (!retrievedFdc) {
      return next(getErrorObj("No FDCs found with the provided ID"));
    }

    // Send the request and attach the FDC
    sendRequest({
      res,
      statusCode: 200,
      message: "Requested FDC information attached",
      data: retrievedFdc,
    });
  } catch (error) {
    return next(error);
  }
};

// Export the module
module.exports = manageFdc;
