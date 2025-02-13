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

const FirstDegreeCreator = mongoose.model(
  "FirstDegreeCreator",
  FirstDegreeCreatorSchema,
  "firstDegreeCreator"
);

module.exports = FirstDegreeCreator;
