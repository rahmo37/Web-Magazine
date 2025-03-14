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
  },
  { timestamps: true, collection: "secondDegreeCreator" }
);


// Get an employee by ID
SecondDegreeCreatorSchema.statics.getSdcByID = async function (ID) {
  return await this.findOne({ sdcID: ID });
};

const SecondDegreeCreator = mongoose.model(
  "SecondDegreeCreator",
  SecondDegreeCreatorSchema,
  "secondDegreeCreator"
);

module.exports = SecondDegreeCreator;
