/**
 * Helper Model
 * * First Degree Creator
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// First Degree Creator Schema
const FirstDegreeCreatorSchema = new Schema(
  {
    fdcID: { type: String, required: true, unique: true },
    creatorName: { type: String, required: true },
    creatorBio: { type: String, default: "" },
    creatorImage: { type: String, default: "" },
  },
  { timestamps: true, collection: "firstDegreeCreator" }
);

// Get an employee by ID
FirstDegreeCreatorSchema.statics.getFdcByID = async function (ID) {
  return await this.findOne({ fdcID: ID });
};

// Create a new FDC
FirstDegreeCreatorSchema.statics.createNewFDC = async function (
  fdcData,
  session = null
) {
  const newFDC = new FirstDegreeCreator(fdcData);
  await newFDC.save({ session });
  return newFDC;
};

// First Degree Creator validation fields
FirstDegreeCreatorSchema.statics.getKeys = function () {
  // Excluded fields
  const exclude = ["fdcID", "_id", "__v", "createdAt", "updatedAt"];
  const allowedKeys = Object.keys(this.schema.paths)
    .map((key) => key.split(".").pop())
    .filter((key) => !exclude.includes(key));
  const keys = [...new Set(allowedKeys)];
  return keys;
};

const FirstDegreeCreator = mongoose.model(
  "FirstDegreeCreator",
  FirstDegreeCreatorSchema,
  "firstDegreeCreator"
);

module.exports = FirstDegreeCreator;
