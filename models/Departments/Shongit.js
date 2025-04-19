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

// Get all the ganIDs currently in the database
SubcategorySchema.statics.getIDs = async function () {
  // 1) grab only the parts you need
  const roots = await this.find({}, { contents: 1, children: 1, _id: 0 });

  const ganIDs = [];

  // 2) define a recursive helper
  function collect(node) {
    // pull IDs out of this node’s contents
    if (Array.isArray(node.contents)) {
      node.contents.forEach((c) => {
        if (c.metadata?.ganID) {
          ganIDs.push(c.metadata.ganID);
        }
      });
    }
    // Then dive into each child
    if (Array.isArray(node.children)) {
      node.children.forEach((child) => collect(child));
    }
  }

  // 3) start from each root
  roots.forEach((eachRoot) => collect(eachRoot));

  return ganIDs;
};

// Creating Model
const Shongit = mongoose.model("Shongit", SubcategorySchema, "shongit");

module.exports = Shongit;
