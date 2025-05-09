/**
 * Department Model
 * * Kobita
 */

// importing packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
  sectionID: { type: String, required: true, unique: true },
  sectionAddedDate: { type: Date, required: true },
  sectionArticle: { type: String, default: "" },
  sectionImages: { type: [String], default: [] },
});

const ArticleSchema = new Schema({
  articleCover: { type: String, required: true },
  articleName: { type: String, required: true },
  articleTrailer: { type: String, default: "" },
  aboutArticle: { type: String, default: "" },
  mainContent: [SectionSchema],
});

const MetadataSchema = new Schema({
  kobID: { type: String, required: true, unique: true },
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
  { timestamps: true, collection: "kobita" }
);

SubcategorySchema.statics.getIDs = async function () {
  const results = await this.aggregate([
    { $unwind: "$content" }, // Flatten 'content' array
    { $project: { _id: 0, kobID: "$content.metadata.kobID" } }, // Extract only kobIDs
  ]);

  return results.map((item) => item.kobID); // all kobIDs in one array
};

const Kobita = mongoose.model("Kobita", SubcategorySchema, "kobita");

module.exports = Kobita;
