/**
 * Department Model
 * * Shomaj o Dorshon
 */

// importing packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
  sectionID: { type: String, required: true, unique: true },
  sectionAddedDate: { type: Date, required: true },
  sectionArticle: { type: String, required: true },
  sectionImages: { type: [String], default: [] },
});

const ArticleSchema = new Schema({
  articleCover: { type: String, required: true },
  articleName: { type: String, required: true },
  articleTrailer: { type: String, default: null },
  aboutArticle: { type: String, default: "" },
  mainContent: [SectionSchema],
});

const MetadataSchema = new Schema({
  shoID: { type: String, required: true, unique: true },
  contentAddedDate: { type: Date, required: true },
  originalWritingDate: { type: Date, default: null },
});

const SubcategorySchema = new Schema(
  {
    subcategoryID: { type: String, required: true, unique: true },
    subcategoryName: { type: String, required: true },
    content: [
      {
        metadata: MetadataSchema,
        article: ArticleSchema,
      },
    ],
  },
  { timestamps: true, collection: "shomajODorshon" }
);

const ShomajODorshon = mongoose.model(
  "ShomajODorshon",
  SubcategorySchema,
  "shomajODorshon"
);

module.exports = ShomajODorshon;
