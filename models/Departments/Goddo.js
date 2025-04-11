/**
 * Department Model
 * * Goddo
 */

// importing packages
const mongoose = require("mongoose");
const { getErrorObj } = require("../../helpers/getErrorObj");

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
SubcategorySchema.statics.getGoddoWithID = async function (godID) {
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

// Get goddo keys
SubcategorySchema.statics.getKeys = function () {
  // Excluded fields
  const exclude = [
    "subcategoryName",
    "_id",
    "__v",
    "content",
    "godID",
    "contentAddedDate",
    "articleTrailer",
    "aboutArticle",
    "mainContent",
    "sectionAddedDate",
    "sectionID",
    "sectionImages",
    "createdAt",
    "updatedAt",
  ];
  const allowedKeys = [
    ...Object.keys(this.schema.paths),
    ...Object.keys(ArticleSchema.paths),
    ...Object.keys(MetadataSchema.paths),
    ...Object.keys(SectionSchema.paths),
  ]
    .map((key) => key.split(".").pop())
    .filter((key) => !exclude.includes(key));

  const keys = [...new Set(allowedKeys)];
  return keys;
};

SubcategorySchema.statics.createAGoddoWithSubcategoryID = async function (
  subcategoryID,
  goddoData,
  session
) {
  // First find the subcategory
  const subcategory = await this.findOne({ subcategoryID });
  // If not found
  if (!subcategory) {
    throw getErrorObj("No subcategory found with the provided subcategoryID");
  }
  // Then add the goddoData
  subcategory.content.push(goddoData);
  // Finally save
  await subcategory.save({ session });
  return subcategory;
};

const Goddo = mongoose.model("Goddo", SubcategorySchema, "goddo");

module.exports = Goddo;
