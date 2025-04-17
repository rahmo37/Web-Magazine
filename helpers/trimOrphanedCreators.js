// This file checks for FDCs without any associated links and deletes them.
const FirstDegreeCreator = require("../models/FirstDegreeCreator");
const Link = require("../models/Link");
const structureChecker = require("./structureChecker");

// Module Scaffolding
const orphanedCreator = {};

orphanedCreator.trimFdcs = async function () {
  try {
    const currentFdcIDs = await FirstDegreeCreator.getIDs();
    const linkFdcIDs = await Link.getFdcIDs();

    if (!structureChecker(linkFdcIDs, currentFdcIDs)) {
      const FdcIDSet = new Set(linkFdcIDs);
      const extraIDsArr = currentFdcIDs.filter((ID) => !FdcIDSet.has(ID));

      if (extraIDsArr.length > 0) {
        const deleteCount = await FirstDegreeCreator.deleteFdcsByIDs(
          extraIDsArr
        );
        console.log("Orphaned FDC(s) deleted", { deleteCount, extraIDsArr });
      } else {
        console.log("No orphaned FDC(s) to delete");
      }
    } else {
      console.log("No orphaned FDC(s) found");
    }
  } catch (error) {
    console.error("Error trimming orphaned FDC(s):", error);
  }
};

module.exports = orphanedCreator;
