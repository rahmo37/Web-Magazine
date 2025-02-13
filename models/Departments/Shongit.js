/**
 * Department Model
 * * Shongit
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

// Section Schema
const SectionSchema = new Schema({
  sectionID: { type: String, required: true, unique: true },
  sectionAddedDate: { type: Date, required: true },
  sectionArticle: { type: String, required: false },
  sectionImages: { type: [String], default: [] },
});

const ArticleSchema = new Schema({
  articleCover: { type: String, required: false }, // Optional
  articleName: { type: String, required: false }, // Optional
  articleTrailer: { type: String, default: "" }, // Optional
  aboutArticle: { type: String, default: "" }, // Optional
  mainContent: [SectionSchema], // Sections inside the article
});

const MetadataSchema = new Schema({
  ganID: { type: String, required: true, unique: true },
  ganLink: { type: String, required: false },
  contentAddedDate: { type: Date, required: true },
  originalWritingDate: { type: Date, required: false }, // Optional
});

const SubcategorySchema = new Schema(
  {
    subcategoryID: { type: String, required: true, unique: true },
    subcategoryName: { type: String, required: true },

    // If this subcategory has children
    children: [this],

    // If this subcategory directly stores multiple metadata & articles
    contents: [
      {
        metadata: MetadataSchema,
        article: ArticleSchema,
      },
    ],
  },
  { timestamps: true, collection: "shongit" }
);

// Creating Model

const Shongit = mongoose.model("Shongit", SubcategorySchema, "shongit");

module.exports = Shongit;
