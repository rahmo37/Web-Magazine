// This file contains all the code for managing goddo

// Imports
const Link = require("../../../models/Link");
const Employee = require("../../../models/Employee");
const Goddo = require("../../../models/Departments/Goddo");
const FirstDegreeCreator = require("../../../models/FirstDegreeCreator");
const SecondDegreeCreator = require("../../../models/SecondDegreeCreator");
const { sendRequest } = require("../../../helpers/sendRequest");
const { getErrorObj } = require("../../../helpers/getErrorObj");

// Module Scaffolding
const manageGoddo = {};

// Get all goddo. Contents will be filtered according to the employeeID unless the employee is an Admin
manageGoddo.getAllGoddo = async function (req, res, next) {
  try {
    // Get the logged in user's id
    const employeeID = req.user.id;

    // Check the employee type (root admin, department admin, not an admin)
    const hasFullAccess = checkAccess(req.user);

    // Get the goddo links
    let goddoLinks = hasFullAccess
      ? await Link.getByContentIDPrefixAndEmpID("god_")
      : await Link.getByContentIDPrefixAndEmpID("god_", employeeID);

    // If no goddo links found
    if (!goddoLinks || goddoLinks.length === 0) {
      return next(getErrorObj("No goddo contents found in repository!"));
    }

    // Use Promise.all to wait for all the async operations in the map to complete
    const allGoddoAndInfo = await Promise.all(
      // Fetch data for each link
      goddoLinks.map(async (eachLink) => {
        const [employee, content, fdc, sdc] = await Promise.all([
          hasFullAccess ? Employee.getEmployeeByID(eachLink.employeeID) : null,
          Goddo.getGoddoWithId(eachLink.contentID),
          FirstDegreeCreator.getFdcByID(eachLink.fdcID),
          SecondDegreeCreator.getSdcByID(eachLink.sdcID),
        ]);

        // If content not found with the link
        if (!content) {
          console.warn("Could not find any content with this link", eachLink);
          return null;
        }

        // If fdc not found with the link
        if (!fdc) {
          console.warn("Could not find any fdc with this link", eachLink);
          return null;
        }

        // If sdc not found with the link
        if (eachLink.sdcID && !sdc) {
          console.warn("Could not find any sdc with this link", eachLink);
          return null;
        }

        // Combine result for each link
        const eachResult = { eachLink, content, fdc, sdc };

        // If employee is a root admin or a department admin then add the employee info
        if (hasFullAccess) {
          // If employee info was not found
          if (!employee) {
            console.warn(
              "Could not find any employee with this link",
              eachLink
            );
            return null;
          }
          eachResult.employee = employee;
        }

        // Return result of each link
        return eachResult;
      })
    );

    // Send the request
    sendRequest({
      res,
      statusCode: 200,
      message:
        "All goddo content attached with employee (If available), fdc, sdc information",
      data: allGoddoAndInfo,
    });
  } catch (error) {
    next(error);
  }
};

manageGoddo.getAGoddo = async function (req, res, next) {
  // Gather necessary info from the request
  const employeeID = req.user.id;
  const hasFullAccess = checkAccess(req.user);
  const godID = req.params.ID;

  // Get the goddo link
  const goddoLink = await Link.getByContentID(godID);

  // If no goddo content is found with the id
  if (!goddoLink) {
    return next(getErrorObj("No goddo contents found with the provided id"));
  }

  // If the employee does not have full access and the
  if (!hasFullAccess && goddoLink.employeeID !== employeeID) {
    return next(
      getErrorObj("You do not have permission to access this content!")
    );
  }

  // Make a promise all call to the related models and retrieve the information
  const [employee, content, fdc, sdc] = await Promise.all([
    hasFullAccess ? Employee.getEmployeeByID(goddoLink.employeeID) : null,
    Goddo.getGoddoWithId(goddoLink.contentID),
    FirstDegreeCreator.getFdcByID(goddoLink.fdcID),
    SecondDegreeCreator.getSdcByID(goddoLink.sdcID),
  ]);

  // If the logged in employee is not an Admin, no need to send the employee information
  const goddoAndInfo = {
    content,
    fdc,
    sdc,
  };

  // If the logged in employee is an Admin, send the corresponding employee info
  if (hasFullAccess) {
    goddoAndInfo.employee = employee;
  }

  // Send the request
  sendRequest({
    res,
    statusCode: 200,
    message:
      "Goddo content attached with employee (If available), fdc, sdc information",
    data: goddoAndInfo,
  });
};

// Export the module
module.exports = manageGoddo;

// Helper functions
function checkAccess(user) {
  return user.employeeType === "ra" || user.employeeType === "da"
    ? true
    : false;
}
