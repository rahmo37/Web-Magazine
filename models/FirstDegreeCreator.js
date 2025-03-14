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

const FirstDegreeCreator = mongoose.model(
  "FirstDegreeCreator",
  FirstDegreeCreatorSchema,
  "firstDegreeCreator"
);

module.exports = FirstDegreeCreator;
