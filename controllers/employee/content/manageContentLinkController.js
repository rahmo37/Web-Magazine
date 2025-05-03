// This file contains all the logic for updating a content's link

// Imports
const Link = require("../../../models/Link");
const structureChecker = require("../../../helpers/structureChecker");
const deepCopy = require("../../../helpers/deepCopy");
const flattenObject = require("../../../helpers/flattenObject");
const { getErrorObj } = require("../../../helpers/getErrorObj");
const { sendRequest } = require("../../../helpers/sendRequest");

// Module scaffolding
const manageLink = {};

// This function updates a contents link
manageLink.updateContentLink = async function (req, res, next) {
  try {
    // Extract the contentID
    const { contentID } = req.params;

    // Link Data
    const linkData = deepCopy(req.body);

    // Check the structure of the request
    const providedKeys = Object.keys(flattenObject(linkData));
    const optionalFields = ["employeeID", "fdcID", "sdcID"];
    if (!structureChecker([], providedKeys, optionalFields)) {
      return next(
        getErrorObj(
          `Link information provided is either missing or contains invalid keys. Please review your submission and try again. At least one key is required. The required keys are: ${optionalFields.join(
            ", "
          )}`,
          400
        )
      );
    }

    // Now perform the updated
    const updatedLink = await Link.updateALinkWithContentID(
      contentID,
      linkData
    );

    sendRequest({
      res,
      statusCode: 200,
      message: "Link updated successfully",
      data: updatedLink,
    });
  } catch (error) {
    return next(error);
  }
};

// Export the module
module.exports = manageLink;
