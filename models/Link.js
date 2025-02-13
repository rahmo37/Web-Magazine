/**
 * Helper Model
 * * Link
 */

// importing packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

// First Degree Creator Schema
const LinkSchema = new Schema(
  {
    linkID: { type: String, required: true, unique: true },
    employeeID: { type: String, required: true },
    contentID: { type: String, required: true },
    fdcID: { type: String, required: true },
    sdcID: { type: String, required: false },
  },
  { timestamps: true, collection: "link" }
);

const Link = mongoose.model("Link", LinkSchema, "link");

module.exports = Link;
