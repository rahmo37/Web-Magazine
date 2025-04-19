// This file checks for creators without any associated links and deletes them.
const FirstDegreeCreator = require("../models/FirstDegreeCreator");
const Link = require("../models/Link");
const structureChecker = require("./structureChecker");

// Module Scaffolding
const orphanedCreator = {};

// This function trims the orphaned creators
orphanedCreator.trimCreator = async function (entity) {
  try {
    const entityIDKeyName =
      entity.modelName === "FirstDegreeCreator" ? "fdcID" : "sdcID";
    const currentEntityIDs = await entity.getIDs();
    const linkEntityIDs = await Link.getEntityIDs(entityIDKeyName);
    console.log(currentEntityIDs, linkEntityIDs);

    if (!structureChecker(linkEntityIDs, currentEntityIDs)) {
      const entityIDSet = new Set(linkEntityIDs);
      const extraIDsArr = currentEntityIDs.filter((ID) => !entityIDSet.has(ID));

      if (extraIDsArr.length > 0) {
        const deleteCount = await entity.deleteByIDs(extraIDsArr);
        console.log(`Orphaned ${entity.modelName}(s) deleted`, {
          deleteCount,
          extraIDsArr,
        });
      } else {
        console.log(`No orphaned ${entity.modelName}(s) to delete`);
      }
    } else {
      console.log(`No orphaned ${entity.modelName}(s) found`);
    }
  } catch (error) {
    console.error(`Error trimming orphaned ${entity.modelName}(s):`, error);
  }
};

module.exports = orphanedCreator;
