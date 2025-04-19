// This script removes orphaned content entries by reconciling all content entities with the Link entity
const Goddo = require("../models/Departments/Goddo");
const Shongit = require("../models/Departments/Shongit");

// Module Scaffolding
const orphanedContent = {};

// This function trims the orphaned contents
orphanedContent.trimContents = async function () {
  await trimmer(Shongit);
};

// Helper function that performs the trimming
async function trimmer(entity) {
  try {
    // Get the ids of the entity
    currentEntityIDs = await entity.getIDs();
    console.log(currentEntityIDs);
  } catch (error) {}
}

module.exports = orphanedContent;
