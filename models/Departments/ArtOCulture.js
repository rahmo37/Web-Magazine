/**
 * Department Model
 * * Art O Culture
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

// Section Schema (For content inside articles)
const SectionSchema = new Schema({
  sectionID: { type: String, required: true, unique: true },
  sectionAddedDate: { type: Date, required: true },
  sectionArticle: { type: String, required: false },
  sectionImages: { type: [String], default: [] },
});

const ArticleSchema = new Schema({
  articleCover: { type: String, required: false }, // Optional
  articleName: { type: String, required: false }, // Optional
  articleTrailer: { type: String, required: false }, // Optional
  aboutArticle: { type: String, required: false }, // Optional
  mainContent: [SectionSchema], // Sections inside the article
});

const MetadataSchema = new Schema({
  artID: { type: String, required: true, unique: true },
  contentAddedDate: { type: Date, required: true },
  originalWritingDate: { type: Date, default: null }, // Optional
});

const SubcategorySchema = new Schema(
  {
    subcategoryID: { type: String, required: true, unique: true },
    subcategoryName: { type: String, required: true },

    // If this subcategory has children (like Chitrokola)
    children: [this],

    // If this subcategory directly stores multiple metadata & articles
    contents: [
      {
        metadata: MetadataSchema,
        article: ArticleSchema,
      },
    ],
  },
  { timestamps: true, collection: "artOCulture" }
);

// Creating Model
const ArtOCulture = mongoose.model(
  "ArtOCulture",
  SubcategorySchema,
  "artOCulture"
);

module.exports = ArtOCulture;
