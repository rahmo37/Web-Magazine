// This file manages all the FDC operations
// Imports
const FirstDegreeCreator = require("../../models/FirstDegreeCreator");
const { sendRequest } = require("../../helpers/sendRequest");
const { getErrorObj } = require("../../helpers/getErrorObj");
const structureChecker = require("../../helpers/structureChecker");
const flattenObject = require("../../helpers/flattenObject");

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

// Update an FDC
manageFdc.updateAnFdc = async function (req, res, next) {
  try {
    // Retrieve the fdcID
    const { fdcID } = req.params;

    // Copy the body
    const body = { ...req.body };

    // Check the structure of the information provide
    const passedInFdcInfo = flattenObject(body); // Flattening the passed in FDC data
    const providedKeys = Object.keys(passedInFdcInfo); // From the passed in FDC info
    const optionalFields = ["creatorName", "creatorBio", "creatorImage"];

    if (!structureChecker([], providedKeys, optionalFields)) {
      return next(
        getErrorObj(
          `FDC information is either missing or contains invalid keys. Please review your submission and try again. At least one key is required. The keys are: ${optionalFields.join(
            ", "
          )}.`,
          400
        )
      );
    }

    // Now update the Fdc
    const updatedFdc = await FirstDegreeCreator.updateAnFdc(fdcID, body);

    // If Update failed
    if (!updatedFdc) {
      return next(getErrorObj());
    }

    // Send the request and attach the FDC
    sendRequest({
      res,
      statusCode: 200,
      message: "Successfully Updated Fdc",
      data: updatedFdc,
    });
  } catch (error) {
    return next(error);
  }
};

// Export the module
module.exports = manageFdc;
