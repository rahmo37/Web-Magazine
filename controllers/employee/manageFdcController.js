// This file manages all the FDC operations
// Imports
const FirstDegreeCreator = require("../../models/FirstDegreeCreator");
const Link = require("../../models/Link");
const { sendRequest } = require("../../helpers/sendRequest");
const { getErrorObj } = require("../../helpers/getErrorObj");
const structureChecker = require("../../helpers/structureChecker");
const flattenObject = require("../../helpers/flattenObject");
const {
  temporaryAllowanceCheck,
} = require("../../helpers/temporaryAllowanceCheck");
const { default: mongoose } = require("mongoose");

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

    const fdcLinks = await Link.findByAllIds({ fdcID });

    if (fdcLinks.some((link) => link.employeeID !== req.user.ID)) {
      const ok = await temporaryAllowanceCheck(req, res);
      if (!ok) {
        return next(
          getErrorObj(
            "Updating this FDC requires Admin approval, please contact you Administrator!"
          )
        );
      }
    }

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

// Delete an FDC and their content
manageFdc.deleteAnFdcAndTheirContent = async function (req, res, next) {
  // Start the session
  const session = await mongoose.startSession();

  try {
    let linkDeletion = null;
    let fdcDeletion = null;

    // Retrieve the ID
    const { fdcID } = req.params;

    // We perform the operations with transaction
    await session.withTransaction(async () => {
      linkDeletion = await Link.deleteManyWithID(`fdcID`, fdcID, session);
      fdcDeletion = await FirstDegreeCreator.deleteByFdcID(fdcID, session);
    });

    if (linkDeletion && fdcDeletion) {
      // Send the request and attach the FDC
      sendRequest({
        res,
        statusCode: 200,
        message: "Successfully deleted the fdc and their content",
        data: {
          linksDeleted: linkDeletion.deletedCount,
          fdcDeleted: fdcDeletion.deletedCount,
        },
      });
    } else {
      return next(getErrorObj());
    }
  } catch (error) {
    return next(error);
  } finally {
    session.endSession();
  }
};

// Export the module
module.exports = manageFdc;
