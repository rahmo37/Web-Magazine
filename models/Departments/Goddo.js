/**
 * Department Model
 * * Goddo
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
  articleTrailer: { type: String, default: "" },
  aboutArticle: { type: String, default: "" },
  mainContent: [SectionSchema],
});

const MetadataSchema = new Schema({
  godID: { type: String, required: true, unique: true },
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
  { timestamps: true, collection: "goddo" }
);

// Get all goddo
SubcategorySchema.statics.getAllGoddo = async function () {
  return await this.find({});
};

// Get one goddo
SubcategorySchema.statics.getGoddoWithId = async function (godID) {
  const result = await this.aggregate([
    { $unwind: "$content" },
    { $match: { "content.metadata.godID": godID } },
    {
      $project: {
        _id: 0,
        subcategoryName: 1,
        metadata: "$content.metadata",
        article: "$content.article",
        _id: "$content._id",
      },
    },
  ]);

  return result.length ? result[0] : null;
};

const Goddo = mongoose.model("Goddo", SubcategorySchema, "goddo");

module.exports = Goddo;
