/**
 * Department Model
 * * Ebook
 */

// importing packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

// Metadata Schema
const MetadataSchema = new Schema({
  eboID: { type: String, required: true, unique: true },
  contentAddedDate: { type: Date, required: true },
  originalWritingDate: { type: Date, default: null },
});

const ArticleSchema = new Schema({
  articleCover: { type: String, required: true },
  articlePublisher: { type: String, required: true },
  articleTitle: { type: String, default: null },
  aboutArticle: { type: String, default: "" },
  pdfUrl: { type: String, required: true },
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
  { timestamps: true, collection: "ebook" }
);

const Ebook = mongoose.model("Ebook", SubcategorySchema, "ebook");

module.exports = Ebook;
