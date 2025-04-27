// This file manages all Goddo Operations

// Imports
const Link = require("../../../models/Link");
const Employee = require("../../../models/Employee");
const Goddo = require("../../../models/Departments/Goddo");
const FirstDegreeCreator = require("../../../models/FirstDegreeCreator");
const SecondDegreeCreator = require("../../../models/SecondDegreeCreator");
const { sendRequest } = require("../../../helpers/sendRequest");
const { getErrorObj } = require("../../../helpers/getErrorObj");
const flattenObject = require("../../../helpers/flattenObject");
const structureChecker = require("../../../helpers/structureChecker");
const { generateID } = require("../../../helpers/generateID");
const deepCopy = require("../../../helpers/deepCopy");
const { dateAndTime } = require("../../../helpers/dateAndTime");
const { default: mongoose } = require("mongoose");

// Module Scaffolding
const manageGoddo = {};

// Get all goddo. Contents will be filtered according to the employeeID unless the employee is an Admin
manageGoddo.getAllGoddo = async function (req, res, next) {
  try {
    // Get the logged in user's ID
    const employeeID = req.user.ID;

    // Check the employee type (root admin, department admin, not an admin)
    const hasFullAccess = checkAccess(req.user);

    // Get the goddo links
    let goddoLinks = hasFullAccess
      ? await Link.getByContentIDPrefixAndEmpID("god_") // All goddo links regardless of employee
      : await Link.getByContentIDPrefixAndEmpID("god_", employeeID); // Only Specific to an employeeID

    // If no goddo links found
    if (!goddoLinks || goddoLinks.length === 0) {
      return next(getErrorObj("No goddo contents found in the repository!"));
    }

    // Use Promise.all to wait for all the async operations in the map to complete
    const allGoddoAndInfo = await Promise.all(
      // Fetch data for each link
      goddoLinks.map(async (eachLink) => {
        const [employee, content, fdc, sdc] = await Promise.all([
          hasFullAccess ? Employee.getEmployeeByID(eachLink.employeeID) : null,
          Goddo.getGoddoWithID(eachLink.contentID),
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
      totalContentLength: allGoddoAndInfo.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get one goddo when ID is provided
manageGoddo.getAGoddo = async function (req, res, next) {
  // Gather necessary info from the request
  // Get the logged in user's ID
  const employeeID = req.user.ID;

  // Check the employee type (root admin, department admin, not an admin)
  const hasFullAccess = checkAccess(req.user);

  // Getting the goddo ID
  const godID = req.params.ID;

  // Get the goddo link
  const goddoLink = await Link.getByContentID(godID);

  // If no goddo content is found with the ID
  if (!goddoLink) {
    return next(getErrorObj("No goddo contents found with the provided ID"));
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
    Goddo.getGoddoWithID(goddoLink.contentID),
    FirstDegreeCreator.getFdcByID(goddoLink.fdcID),
    SecondDegreeCreator.getSdcByID(goddoLink.sdcID),
  ]);

  if (!content) {
    console.warn("Could not find any content with this link", goddoLink);
    return next(getErrorObj());
  }

  // If fdc not found with the link
  if (!fdc) {
    console.warn("Could not find any fdc with this link", goddoLink);
    return next(getErrorObj());
  }

  // If sdc not found with the link
  if (goddoLink.sdcID && !sdc) {
    console.warn("Could not find any sdc with this link", goddoLink);
    return next(getErrorObj());
  }

  // If the logged in employee is not an Admin, no need to send the employee information
  const goddoAndInfo = {
    content,
    fdc,
    sdc,
  };

  // If the logged in employee is an Admin or Department Admin, send the corresponding employee info
  if (hasFullAccess) {
    // If employee info was not found
    if (!employee) {
      console.warn("Could not find any employee with this link", goddoLink);
      return next(getErrorObj());
    }
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

// Post a goddo
manageGoddo.postAGoddo = async function (req, res, next) {
  // Start a new session
  const session = await mongoose.startSession();
  try {
    // Gather necessary info from the request
    // Get the logged in user's ID. The content will be added to the database under the logged-in employee
    const loggedInEmployeeID = req.user.ID;

    // New entities
    const newLink = {
      // Add the employeeID to the new link
      employeeID: loggedInEmployeeID,
    };
    let newFdc = null;
    let newSdc = null;
    let newContent = null;
    let subcategoryID = null;

    // Necessary variables
    let currentDate = dateAndTime.getUtcRaw();

    // Extract the body
    const body = { ...req.body };

    // If fdc or content is not found in the body
    if (!body.fdc || !body.content) {
      return next(
        getErrorObj(
          "First Degree Creator and the Content details are required to create a content",
          400
        )
      );
    }

    //? FDC
    // If an ID is provided for fdc
    if ("fdcID" in body.fdc) {
      let existingFdc = await FirstDegreeCreator.getFdcByID(body.fdc.fdcID);

      // If no Fdc found
      if (!existingFdc) {
        return next(
          getErrorObj(
            "No First Degree Creator found with the provided fdcID",
            400
          )
        );
      }

      // If found then we add the fdcID to the new link
      newLink.fdcID = body.fdc.fdcID;
    } else {
      // If newFdc information is provided

      // Check the structure of the information provided
      const passedInFdcInfo = flattenObject(body.fdc); // Flattening the passed in FDC data
      const fdcKeys = FirstDegreeCreator.getKeys(); // From the FDC model
      const providedKeys = Object.keys(passedInFdcInfo); // From the passed in FDC info
      if (!structureChecker(fdcKeys, providedKeys)) {
        return next(
          getErrorObj(
            `FDC information is either missing or contains invalid keys. Please review your submission and try again. If providing just an existing ID, make sure your key is spelled 'fdcID' exactly. Else The required keys are: ${fdcKeys.join(
              ", "
            )}.`,
            400
          )
        );
      }

      // After validation of the structure
      // Generate a new fdcID
      const fdcID = generateID("fdc_");
      newFdc = {
        ...passedInFdcInfo,
        fdcID,
        uploaderEmployeeID: loggedInEmployeeID,
      };
      newLink.fdcID = fdcID;
    }

    //? SDC
    // If Sdc is provided
    if (body.sdc) {
      // If an ID is provided for sdc
      if ("sdcID" in body.sdc) {
        let existingSdc = await SecondDegreeCreator.getSdcByID(body.sdc.sdcID);

        // If no Sdc found
        if (!existingSdc) {
          return next(
            getErrorObj(
              "No Second Degree Creator found with the provided sdcID",
              400
            )
          );
        }

        // If found then we add the sdc ID to the new link
        newLink.sdcID = body.sdc.sdcID;
      } else {
        // If newSdc information is provided

        // Check the structure of the information
        const passedInSdcInfo = flattenObject(body.sdc);
        const sdcKeys = SecondDegreeCreator.getKeys();
        const providedKeys = Object.keys(passedInSdcInfo);
        if (!structureChecker(sdcKeys, providedKeys)) {
          return next(
            getErrorObj(
              `SDC information is either missing or contains invalid keys. Please review your submission and try again. If providing just an existing ID, make sure your key is spelled 'sdcID' exactly. Else The required keys are: ${sdcKeys.join(
                ", "
              )}.`,
              400
            )
          );
        }

        // Generate a new sdcID
        const sdcID = generateID("sdc_");
        newSdc = {
          ...passedInSdcInfo,
          sdcID,
          uploaderEmployeeID: loggedInEmployeeID,
        };
        newLink.sdcID = sdcID;
      }
    } else {
      newLink.sdcID = null;
    }

    //!delete console.log(newLink, newFdc, newSdc);

    //? Content
    // Check if the subcategoryID, metadata, article and mainContent is present and valid
    if (
      !body.content.subcategoryID ||
      !body.content.metadata ||
      !body.content.article ||
      !body.content.article.mainContent
    ) {
      return next(
        getErrorObj(
          `The content field is either missing or contains invalid structural data. Please ensure that the following fields are included and properly structured: subcategoryID, metadata, article, and mainContent.`,
          400
        )
      );
    }

    // Now check if the internal properties are provided correctly
    const passedInContentInfo = flattenObject(body.content);
    const contentKeys = Goddo.getKeys();
    const providedKeys = Object.keys(passedInContentInfo);
    const optionalKeys = [
      "articleTrailer",
      "aboutArticle",
      "originalWritingDate",
      "sectionImages",
    ];

    if (!structureChecker(contentKeys, providedKeys, optionalKeys)) {
      return next(
        getErrorObj(
          `Content information is either missing or contains invalid keys. Please review your submission and try again. The required keys are: ${contentKeys.join(
            ", "
          )}, ${optionalKeys.join("(optional), ")}(optional).`,
          400
        )
      );
    }

    // Make deep copy of the content
    newContent = deepCopy(body.content);

    // Save the subcategoryID and the delete it from the new content
    subcategoryID = newContent.subcategoryID;
    delete newContent.subcategoryID;

    // Manually add necessary information
    // Metadata
    newContent.metadata.godID = generateID("god_");
    newContent.metadata.contentAddedDate = currentDate;

    // Main Content
    // Iteratively check each section and and add necessary properties
    for (const eachSec of newContent.article.mainContent) {
      // If no sectionArticle was found send an error
      if (!eachSec.sectionArticle) {
        return next(
          getErrorObj(
            `One or more sections are missing the sectionArticle property.`,
            400
          )
        );
      }
      // Add the sectionImages property if does not exists already
      if (!eachSec.sectionImages) {
        eachSec.sectionImages = [];
      }

      // Add the sectionID and the sectionAddedDate
      eachSec.sectionID = generateID("sec_");
      eachSec.sectionAddedDate = currentDate;
    }

    // Update the new link with the new goddo id
    newLink.contentID = newContent.metadata.godID;

    // Now add a new linkID
    newLink.linkID = generateID("lin_");

    //!delete console.log(newLink, newFdc, newSdc, newContent, subcategoryID, newContent.article.mainContent);

    // Start DB operations
    await session.withTransaction(async () => {
      // Create new FDC if not null
      if (newFdc) {
        await FirstDegreeCreator.createNewFDC(newFdc, session);
      }
      // Create new SDC if not null
      if (newSdc) {
        await SecondDegreeCreator.createNewSDC(newSdc, session);
      }
      // Create the content
      await Goddo.createAGoddoWithSubcategoryID(
        subcategoryID,
        newContent,
        session
      );
      // Create the link
      await Link.createLink(newLink, session);
    });

    // Send the request
    sendRequest({
      res,
      statusCode: 201,
      message: "Content created successfully",
      data: newLink,
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

// Patch/Update a goddo section
manageGoddo.updateAGoddoSection = async function (req, res, next) {
  try {
    // Retrieve the subcategoryID, godID, and sectionID
    const { subID, godID, secID = null } = req.params;
    if (!secID) {
      return next();
    }
    const sectionData = deepCopy(req.body);

    // Check the section data
    if (
      !structureChecker([], Object.keys(sectionData), [
        "sectionArticle",
        "sectionImages",
      ])
    ) {
      return next(
        getErrorObj(
          `Section information is either missing or contains invalid keys. Please review your submission and try again. The required keys are: sectionArticle and/or sectionImages. ${
            sectionData.section
              ? "Keys do not need to be wrapped inside a section object wrapper"
              : ""
          }`,
          400
        )
      );
    }

    // Update the goddo section
    const updatedSection = await Goddo.updateAGoddoSection(
      subID,
      godID,
      secID,
      sectionData
    );

    // Send the response with the updated section data
    sendRequest({
      res,
      statusCode: 200,
      message: "Updated section successfully",
      data: updatedSection,
    });
  } catch (error) {
    next(error);
  }
};

// Patch/Update metadata of a goddo
manageGoddo.updateAGoddoMetadata = async function (req, res, next) {
  try {
    const body = deepCopy(req.body);

    // Define the allowed keys
    const allowedKey = ["article", "metadata"];

    // Extract the provided keys
    const keys = Object.keys(body);

    // Exactly one valid key must be provided.
    if (keys.length !== 1 || !allowedKey.includes(keys[0])) {
      return next(
        getErrorObj(
          `Invalid request body. Please provide exactly one of these fields: article or metadata.`,
          400
        )
      );
    }

    // If article is provided
    if (keys[0] === "article") {
      return next();
    }

    // If metadata is provided, we start its logic
    // Extract the subID and the godID
    const { subID, godID } = req.params;
    const metadata = { ...body.metadata };

    // Check the structure
    const providedKeys = Object.keys(flattenObject(metadata));
    const metadataKeys = Goddo.getMetadataKeys();
    if (!structureChecker(metadataKeys, providedKeys)) {
      return next(
        getErrorObj(
          `Metadata information provided is either missing or contains invalid keys. Please review your submission and try again. The required keys are: ${metadataKeys.join(
            ", "
          )}.`,
          400
        )
      );
    }

    // Update the goddo metadata
    const updatedMetadata = await Goddo.updateAGoddoMetadata(
      subID,
      godID,
      metadata
    );

    // Send the response with the updated metadata
    sendRequest({
      res,
      statusCode: 200,
      message: "Updated metadata successfully",
      data: updatedMetadata,
    });
  } catch (error) {
    next(error);
  }
};

// Patch/Update article data of a goddo
manageGoddo.updateAGoddoArticledata = async function (req, res, next) {
  try {
    // Extract IDs from the request
    const { subID, godID } = req.params;
    const articleData = deepCopy(req.body.article);

    // Check the structure
    const providedKeys = Object.keys(flattenObject(articleData));
    const articleKeys = Goddo.getArticleKeys();
    const optionalFields = ["articleTrailer", "aboutArticle"];
    if (!structureChecker(articleKeys, providedKeys, optionalFields)) {
      return next(
        getErrorObj(
          `Article information provided is either missing or contains invalid keys. Please review your submission and try again. The required keys are: ${articleKeys.join(
            ", "
          )}, ${optionalFields.join("(Optional), ")}(Optional).${
            providedKeys.includes("mainContent")
              ? ` NOTE: You cannot change Main Content through this endpoint`
              : ""
          }`,
          400
        )
      );
    }

    // Update the goddo metadata
    const updatedArticleData = await Goddo.updateAGoddoArticle(
      subID,
      godID,
      articleData
    );

    // Send the response with the updated article data
    sendRequest({
      res,
      statusCode: 200,
      message: "Updated article successfully",
      data: updatedArticleData,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a goddo section
manageGoddo.deleteAGoddoSection = async function (req, res, next) {
  try {
    // Retrieve the subcategoryID, godID, and sectionID
    const { subID, godID, secID = null } = req.params;

    // If no section is provided we call the next middleware
    if (!secID) {
      return next();
    }

    // If secID is provided we delete the section
    const currentMainContentArray = await Goddo.deleteAGoddoSection(
      subID,
      godID,
      secID
    );

    // Send the response with the updated article data
    sendRequest({
      res,
      statusCode: 200,
      message: "Deleted section successfully",
      data: currentMainContentArray,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a goddo
manageGoddo.deleteAGoddo = async function (req, res, next) {
  let isDeletedGoddo = false;
  let isDeletedLink = false;

  // Start a new session
  const session = await mongoose.startSession();
  try {
    // Retrieve the subcategoryID, godID
    const { subID, godID } = req.params;

    await session.withTransaction(async () => {
      // Now we delete the goddo as part of a session
      isDeletedGoddo = await Goddo.deleteAGoddoByID(subID, godID, session);

      // Now we delete the link as part of a session
      isDeletedLink = await Link.deleteByContentID(godID, session);
    });

    if (isDeletedGoddo && isDeletedLink) {
      // Send the response with the updated article data
      sendRequest({
        res,
        statusCode: 200,
        message: "Goddo deleted successfully",
      });
    } else {
      throw getErrorObj();
    }
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

// Helper functions
function checkAccess(user) {
  return user.employeeType === "ra" || user.employeeType === "da"
    ? true
    : false;
}

// Export the module
module.exports = manageGoddo;
