// This file checks for creators without any associated links and deletes them.
const Link = require("../models/Link");
const structureChecker = require("./structureChecker");

// Module Scaffolding
const orphanedCreator = {};
const hemantoFdcID = process.env.HEMANTO_FDCID;
const hemantoSdcID = process.env.HEMANTO_SDCID;

// This function trims the orphaned creators
orphanedCreator.trimCreator = async function (entity) {
  try {
    const hemantoID =
      entity.modelName === "FirstDegreeCreator" ? hemantoFdcID : hemantoSdcID;
    const entityIDKeyName =
      entity.modelName === "FirstDegreeCreator" ? "fdcID" : "sdcID";
    const currentEntityIDs = [...new Set(await entity.getIDs(hemantoID))];
    const linkEntityIDs = [
      ...new Set(await Link.getEntityIDs(entityIDKeyName, hemantoID)),
    ];

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
        console.log(
          `No orphaned ${entity.modelName}(s) to delete. However the structure did not match with the Link collection please reconcile the Link entity promptly`
        );
      }
    } else {
      console.log(`No orphaned ${entity.modelName}(s) found`);
    }
  } catch (error) {
    console.error(`Error trimming orphaned ${entity.modelName}(s):`, error);
  }
};

module.exports = orphanedCreator;
