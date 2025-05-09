/**
 * Helper Model
 * * Second Degree Creator
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Second Degree Creator Schema
const SecondDegreeCreatorSchema = new Schema(
  {
    sdcID: { type: String, required: true, unique: true },
    creatorName: { type: String, required: true },
    creatorBio: { type: String, default: "" },
    creatorImage: { type: String, default: "" },
    uploaderEmployeeID: { type: String, required: true },
  },
  { timestamps: true, collection: "secondDegreeCreator" }
);

// Get an employee by ID
SecondDegreeCreatorSchema.statics.getSdcByID = async function (ID) {
  return await this.findOne({ sdcID: ID });
};

// Create a new SDC
SecondDegreeCreatorSchema.statics.createNewSDC = async function (
  sdcData,
  session = null
) {
  const newSDC = new SecondDegreeCreator(sdcData);
  await newSDC.save({ session });
  return newSDC;
};

// Get the SDC model keys
SecondDegreeCreatorSchema.statics.getKeys = function () {
  // Excluded fields
  const exclude = [
    "sdcID",
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

// Delete many SDCs with sdcIDs array
SecondDegreeCreatorSchema.statics.deleteByIDs = async function (sdcIDsArr) {
  const result = await SecondDegreeCreator.deleteMany({
    sdcID: { $in: sdcIDsArr },
  });
  return result.deletedCount;
};

// Get all the SDC IDs
SecondDegreeCreatorSchema.statics.getIDs = async function (excludeID) {
  const filter = excludeID ? { sdcID: { $ne: excludeID } } : {};
  const result = await this.find(filter, { sdcID: 1, _id: 0 });
  console.log(result.map((doc) => doc.sdcID));
  return result.map((doc) => doc.sdcID);
};


const SecondDegreeCreator = mongoose.model(
  "SecondDegreeCreator",
  SecondDegreeCreatorSchema,
  "secondDegreeCreator"
);

module.exports = SecondDegreeCreator;
