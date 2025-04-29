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
    uploaderEmployeeID: { type: String, required: true, unique: true },
  },
  { timestamps: true, collection: "firstDegreeCreator" }
);

// Get an FDC by ID
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

// Get all the FDCs
FirstDegreeCreatorSchema.statics.getAllFDCs = function () {
  return this.find({}).select("-__v -_id -createdAt -updatedAt");
};

// First Degree Creator validation fields
FirstDegreeCreatorSchema.statics.getKeys = function () {
  // Excluded fields
  const exclude = [
    "fdcID",
    "_id",
    "__v",
    "createdAt",
    "updatedAt",
    "uploaderEmployeeID",
  ];
  const allowedKeys = Object.keys(this.schema.paths)
    .map((key) => key.split(".").pop())
    .filter((key) => !exclude.includes(key));
  const keys = [...new Set(allowedKeys)];
  return keys;
};

FirstDegreeCreatorSchema.statics.updateAnFdc = async function (fdcID, fdcData) {
  // Find the Fdc
  const fdc = await this.findOne({ fdcID });

  // If no Fdc is found
  if (!fdc) {
    throw getErrorObj("No fdc found with the provided fdcID", 400);
  }

  // Merge the updated data with the existing fdc
  Object.assign(fdc, fdcData);

  return await fdc.save();
};

// Delete many FDCs with fdcIDs array
FirstDegreeCreatorSchema.statics.deleteByIDs = async function (fdcIDsArr) {
  const result = await FirstDegreeCreator.deleteMany({
    fdcID: { $in: fdcIDsArr },
  });
  return result.deletedCount;
};

// Delete one FDC with ID
FirstDegreeCreatorSchema.statics.deleteByFdcID = async function (
  fdcID,
  session = null
) {
  // If no fdcID is provided
  if (!fdcID) {
    throw new Error("fdcID is required");
  }

  // Prepare options
  const opts = session ? { session } : {};

  // Check existence (inside session if provided)
  const existing = await this.findOne({ fdcID }, null, opts);
  if (!existing) {
    throw new Error(`No FirstDegreeCreator found with fdcID provided`);
  }

  // Delete the document (inside session if provided)
  const result = await this.deleteOne({ fdcID }, opts);
  return result;
};

// Get all the FDC IDs
FirstDegreeCreatorSchema.statics.getIDs = async function () {
  const result = await this.find({}, { fdcID: 1, _id: 0 });
  return result.map((doc) => doc.fdcID);
};

const FirstDegreeCreator = mongoose.model(
  "FirstDegreeCreator",
  FirstDegreeCreatorSchema,
  "firstDegreeCreator"
);

module.exports = FirstDegreeCreator;
