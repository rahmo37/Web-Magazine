// This script removes orphaned content entries by reconciling all content entities with the Link entity
const Goddo = require("../models/Departments/Goddo");
const Shongit = require("../models/Departments/Shongit");
const Link = require("../models/Link");
const structureChecker = require("./structureChecker");

// Module Scaffolding
const orphanedContent = {};

// This function trims the orphaned contents
orphanedContent.trimContents = async function () {
  await trimmer(Goddo, "god_");
  await trimmer(Shongit, "gan_");
};

// Helper function that performs the trimming
async function trimmer(entity, IDPrefix) {
  try {
    // Get the ids of the entity
    const currentEntityIDs = await entity.getIDs();

    const linkEntityIDs = (await Link.getEntityIDs("contentID")).filter((ID) =>
      ID.startsWith(IDPrefix)
    );

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
    console.log(error);
  }
}

module.exports = orphanedContent;
